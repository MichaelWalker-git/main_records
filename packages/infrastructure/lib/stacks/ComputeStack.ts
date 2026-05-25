import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  albSg: ec2.SecurityGroup;
  ecsSg: ec2.SecurityGroup;
  dbSecret: secretsmanager.ISecret;
  dbProxy: rds.DatabaseProxy;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  documentsBucket: s3.Bucket;
  classifyQueue: sqs.Queue;
  opensearchDomain: opensearch.Domain;
}

export class ComputeStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly backendService: ecs.FargateService;
  public readonly frontendService: ecs.FargateService;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const backendRepo = new ecr.Repository(this, 'BackendRepo', {
      repositoryName: 'maine-rms/backend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    const frontendRepo = new ecr.Repository(this, 'FrontendRepo', {
      repositoryName: 'maine-rms/frontend',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: 'maine-rms-cluster',
      containerInsights: true,
    });

    this.alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSg,
    });

    const httpsListener = this.alb.addListener('HttpsListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.fixedResponse(503, {
        contentType: 'text/plain',
        messageBody: 'Service Unavailable',
      }),
    });

    // Backend service
    const backendTaskRole = new iam.Role(this, 'BackendTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    props.dbSecret.grantRead(backendTaskRole);
    props.documentsBucket.grantReadWrite(backendTaskRole);
    props.classifyQueue.grantSendMessages(backendTaskRole);
    props.opensearchDomain.grantReadWrite(backendTaskRole);

    const backendTaskDef = new ecs.FargateTaskDefinition(this, 'BackendTaskDef', {
      cpu: 512,
      memoryLimitMiB: 1024,
      taskRole: backendTaskRole,
    });

    backendTaskDef.addContainer('backend', {
      image: ecs.ContainerImage.fromEcrRepository(backendRepo, 'latest'),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        DB_PROXY_ENDPOINT: props.dbProxy.endpoint,
        DB_PORT: '5433',
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
        DOCUMENTS_BUCKET: props.documentsBucket.bucketName,
        CLASSIFY_QUEUE_URL: props.classifyQueue.queueUrl,
        OPENSEARCH_ENDPOINT: props.opensearchDomain.domainEndpoint,
      },
      secrets: {
        DB_SECRET: ecs.Secret.fromSecretsManager(props.dbSecret),
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'backend',
        logRetention: logs.RetentionDays.ONE_MONTH,
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    });

    this.backendService = new ecs.FargateService(this, 'BackendService', {
      cluster: this.cluster,
      taskDefinition: backendTaskDef,
      desiredCount: 2,
      securityGroups: [props.ecsSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const backendScaling = this.backendService.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 10 });
    backendScaling.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });

    const backendTg = httpsListener.addTargets('BackendTarget', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [this.backendService],
      healthCheck: { path: '/health', interval: cdk.Duration.seconds(30) },
      conditions: [elbv2.ListenerCondition.pathPatterns(['/api/*'])],
      priority: 10,
    });

    // Frontend service
    const frontendTaskDef = new ecs.FargateTaskDefinition(this, 'FrontendTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    frontendTaskDef.addContainer('frontend', {
      image: ecs.ContainerImage.fromEcrRepository(frontendRepo, 'latest'),
      portMappings: [{ containerPort: 80 }],
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'frontend',
        logRetention: logs.RetentionDays.ONE_MONTH,
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:80/ || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    });

    this.frontendService = new ecs.FargateService(this, 'FrontendService', {
      cluster: this.cluster,
      taskDefinition: frontendTaskDef,
      desiredCount: 2,
      securityGroups: [props.ecsSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const frontendScaling = this.frontendService.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 6 });
    frontendScaling.scaleOnCpuUtilization('CpuScaling', { targetUtilizationPercent: 70 });

    httpsListener.addTargets('FrontendTarget', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [this.frontendService],
      healthCheck: { path: '/', interval: cdk.Duration.seconds(30) },
      conditions: [elbv2.ListenerCondition.pathPatterns(['/*'])],
      priority: 50,
    });

    new cdk.CfnOutput(this, 'AlbDnsName', { value: this.alb.loadBalancerDnsName });
    new cdk.CfnOutput(this, 'BackendRepoUri', { value: backendRepo.repositoryUri });
    new cdk.CfnOutput(this, 'FrontendRepoUri', { value: frontendRepo.repositoryUri });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-ELB2', reason: 'ALB access logging configured in CDN stack via CloudFront' },
      { id: 'AwsSolutions-EC23', reason: 'ALB requires public ingress on port 443 for HTTPS traffic' },
      { id: 'AwsSolutions-IAM5', reason: 'Wildcard permissions scoped to specific resources via grants' },
      { id: 'AwsSolutions-ECS2', reason: 'Environment variables contain non-sensitive configuration only' },
    ]);
  }
}
