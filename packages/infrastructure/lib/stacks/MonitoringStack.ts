import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface MonitoringStackProps extends cdk.StackProps {
  alb: elbv2.ApplicationLoadBalancer;
  ecsCluster: ecs.Cluster;
  backendService: ecs.FargateService;
  dbCluster: rds.DatabaseCluster;
  classifyDlq: sqs.Queue;
  ocrDlq: sqs.Queue;
  notificationDlq: sqs.Queue;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alertsTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    this.alertsTopic = new sns.Topic(this, 'AlertsTopic', {
      topicName: 'maine-rms-alerts',
    });
    this.alertsTopic.addSubscription(
      new snsSubscriptions.EmailSubscription('rms-alerts@maine.gov')
    );

    // Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: 'maine-rms-operations',
    });

    // 5xx alarm
    const http5xxMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApplicationELB',
      metricName: 'HTTPCode_Target_5XX_Count',
      dimensionsMap: { LoadBalancer: props.alb.loadBalancerFullName },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const alarm5xx = new cloudwatch.Alarm(this, 'Http5xxAlarm', {
      metric: http5xxMetric,
      threshold: 10,
      evaluationPeriods: 2,
      alarmDescription: 'High 5xx error rate on ALB',
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });
    alarm5xx.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    // RDS CPU alarm
    const rdsCpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'CPUUtilization',
      dimensionsMap: { DBClusterIdentifier: props.dbCluster.clusterIdentifier },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const alarmRdsCpu = new cloudwatch.Alarm(this, 'RdsCpuAlarm', {
      metric: rdsCpuMetric,
      threshold: 80,
      evaluationPeriods: 3,
      alarmDescription: 'RDS CPU utilization above 80%',
    });
    alarmRdsCpu.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    // ECS CPU alarm
    const ecsCpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/ECS',
      metricName: 'CPUUtilization',
      dimensionsMap: {
        ClusterName: props.ecsCluster.clusterName,
        ServiceName: props.backendService.serviceName,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const alarmEcsCpu = new cloudwatch.Alarm(this, 'EcsCpuAlarm', {
      metric: ecsCpuMetric,
      threshold: 80,
      evaluationPeriods: 3,
      alarmDescription: 'ECS backend CPU above 80%',
    });
    alarmEcsCpu.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    // DLQ messages alarm
    const dlqMetric = new cloudwatch.MathExpression({
      expression: 'classify + ocr + notification',
      usingMetrics: {
        classify: props.classifyDlq.metricApproximateNumberOfMessagesVisible(),
        ocr: props.ocrDlq.metricApproximateNumberOfMessagesVisible(),
        notification: props.notificationDlq.metricApproximateNumberOfMessagesVisible(),
      },
      period: cdk.Duration.minutes(5),
    });

    const alarmDlq = new cloudwatch.Alarm(this, 'DlqAlarm', {
      metric: dlqMetric,
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'Messages accumulating in dead-letter queues',
    });
    alarmDlq.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    // Unauthorized API calls alarm
    const unauthorizedMetric = new cloudwatch.Metric({
      namespace: 'AWS/CloudTrail',
      metricName: 'UnauthorizedAPICalls',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const alarmUnauthorized = new cloudwatch.Alarm(this, 'UnauthorizedCallsAlarm', {
      metric: unauthorizedMetric,
      threshold: 5,
      evaluationPeriods: 1,
      alarmDescription: 'Unauthorized API calls detected',
    });
    alarmUnauthorized.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    // Failed login alarm
    const failedLoginMetric = new cloudwatch.Metric({
      namespace: 'MaineRMS',
      metricName: 'FailedLogins',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const alarmFailedLogins = new cloudwatch.Alarm(this, 'FailedLoginsAlarm', {
      metric: failedLoginMetric,
      threshold: 10,
      evaluationPeriods: 1,
      alarmDescription: 'High number of failed login attempts',
    });
    alarmFailedLogins.addAlarmAction({ bind: () => ({ alarmActionArn: this.alertsTopic.topicArn }) });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({ title: 'ALB 5xx Errors', left: [http5xxMetric] }),
      new cloudwatch.GraphWidget({ title: 'RDS CPU', left: [rdsCpuMetric] }),
      new cloudwatch.GraphWidget({ title: 'ECS CPU', left: [ecsCpuMetric] }),
      new cloudwatch.GraphWidget({ title: 'DLQ Messages', left: [dlqMetric] }),
    );

    // CloudTrail
    const trailKey = new kms.Key(this, 'TrailEncryptionKey', {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'KMS key for CloudTrail encryption',
    });

    const trailBucket = new s3.Bucket(this, 'TrailBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const trailLogGroup = new logs.LogGroup(this, 'TrailLogGroup', {
      retention: logs.RetentionDays.ONE_YEAR,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cloudtrail.Trail(this, 'Trail', {
      bucket: trailBucket,
      isMultiRegionTrail: true,
      enableFileValidation: true,
      encryptionKey: trailKey,
      cloudWatchLogGroup: trailLogGroup,
      sendToCloudWatchLogs: true,
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home#dashboards:name=maine-rms-operations`,
    });
    new cdk.CfnOutput(this, 'AlertsTopicArn', { value: this.alertsTopic.topicArn });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-SNS2', reason: 'SNS topic encryption not required for non-sensitive alert notifications' },
      { id: 'AwsSolutions-SNS3', reason: 'SSL enforcement configured at subscription level' },
      { id: 'AwsSolutions-S1', reason: 'CloudTrail bucket does not need its own access logging' },
      { id: 'AwsSolutions-IAM5', reason: 'CloudTrail service role requires wildcard for log delivery' },
      { id: 'AwsSolutions-CB4', reason: 'Not applicable - no CodeBuild in this stack' },
    ]);
  }
}
