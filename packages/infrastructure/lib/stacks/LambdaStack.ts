import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  lambdaSg: ec2.SecurityGroup;
  dbSecret: secretsmanager.ISecret;
  dbProxy: rds.DatabaseProxy;
  documentsBucket: s3.Bucket;
  exportsBucket: s3.Bucket;
  classifyQueue: sqs.Queue;
  ocrQueue: sqs.Queue;
  notificationQueue: sqs.Queue;
  opensearchDomain: opensearch.Domain;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const commonEnv = {
      DB_PROXY_ENDPOINT: props.dbProxy.endpoint,
      DB_PORT: '5433',
      DOCUMENTS_BUCKET: props.documentsBucket.bucketName,
      OPENSEARCH_ENDPOINT: props.opensearchDomain.domainEndpoint,
    };

    const vpcConfig = {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [props.lambdaSg],
    };

    // AI Classify
    const classifyFn = new lambda.Function(this, 'AiClassifyFn', {
      functionName: 'maine-rms-ai-classify',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: { ...commonEnv },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(classifyFn);
    props.documentsBucket.grantRead(classifyFn);
    props.opensearchDomain.grantWrite(classifyFn);
    classifyFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: [`arn:aws:bedrock:${this.region}::foundation-model/*`],
    }));
    classifyFn.addEventSource(new lambdaEventSources.SqsEventSource(props.classifyQueue, { batchSize: 5 }));

    // AI OCR
    const ocrFn = new lambda.Function(this, 'AiOcrFn', {
      functionName: 'maine-rms-ai-ocr',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.minutes(10),
      memorySize: 1024,
      environment: { ...commonEnv },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(ocrFn);
    props.documentsBucket.grantRead(ocrFn);
    ocrFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['textract:StartDocumentAnalysis', 'textract:GetDocumentAnalysis', 'textract:StartDocumentTextDetection', 'textract:GetDocumentTextDetection'],
      resources: ['*'],
    }));
    ocrFn.addEventSource(new lambdaEventSources.SqsEventSource(props.ocrQueue, { batchSize: 2 }));

    // Notification Send
    const notificationFn = new lambda.Function(this, 'NotificationSendFn', {
      functionName: 'maine-rms-notification-send',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: { ...commonEnv },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(notificationFn);
    notificationFn.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: [`arn:aws:ses:${this.region}:${this.account}:identity/*`],
    }));
    notificationFn.addEventSource(new lambdaEventSources.SqsEventSource(props.notificationQueue, { batchSize: 10 }));

    // Retention Alerts
    const retentionFn = new lambda.Function(this, 'RetentionAlertsFn', {
      functionName: 'maine-rms-retention-alerts',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: { ...commonEnv, NOTIFICATION_QUEUE_URL: props.notificationQueue.queueUrl },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(retentionFn);
    props.notificationQueue.grantSendMessages(retentionFn);
    new events.Rule(this, 'RetentionAlertsRule', {
      ruleName: 'maine-rms-retention-alerts',
      schedule: events.Schedule.cron({ minute: '0', hour: '6', day: '*', month: '*', year: '*' }),
      targets: [new targets.LambdaFunction(retentionFn)],
    });

    // Overdue Checker
    const overdueFn = new lambda.Function(this, 'OverdueCheckerFn', {
      functionName: 'maine-rms-overdue-checker',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: { ...commonEnv, NOTIFICATION_QUEUE_URL: props.notificationQueue.queueUrl },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(overdueFn);
    props.notificationQueue.grantSendMessages(overdueFn);
    new events.Rule(this, 'OverdueCheckerRule', {
      ruleName: 'maine-rms-overdue-checker',
      schedule: events.Schedule.cron({ minute: '0', hour: '8', day: '*', month: '*', year: '*' }),
      targets: [new targets.LambdaFunction(overdueFn)],
    });

    // Report Export
    const reportExportFn = new lambda.Function(this, 'ReportExportFn', {
      functionName: 'maine-rms-report-export',
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline('exports.handler = async () => ({ statusCode: 200 });'),
      timeout: cdk.Duration.minutes(5),
      memorySize: 512,
      environment: { ...commonEnv, EXPORTS_BUCKET: props.exportsBucket.bucketName },
      ...vpcConfig,
    });
    props.dbSecret.grantRead(reportExportFn);
    props.exportsBucket.grantWrite(reportExportFn);

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-IAM4', reason: 'Lambda basic execution role is AWS managed and acceptable' },
      { id: 'AwsSolutions-IAM5', reason: 'Textract actions require wildcard resource; Bedrock model ARN uses wildcard for flexibility' },
      { id: 'AwsSolutions-L1', reason: 'Node.js 22 is the latest supported runtime' },
    ]);
  }
}
