import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  ecsSg: ec2.SecurityGroup;
  lambdaSg: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbProxy: rds.DatabaseProxy;
  public readonly rdsSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.rdsSg = new ec2.SecurityGroup(this, 'RdsSg', {
      vpc: props.vpc,
      description: 'RDS security group',
      allowAllOutbound: false,
    });
    this.rdsSg.addIngressRule(props.ecsSg, ec2.Port.tcp(5432), 'From ECS');
    this.rdsSg.addIngressRule(props.lambdaSg, ec2.Port.tcp(5432), 'From Lambda');

    const encryptionKey = new kms.Key(this, 'DbEncryptionKey', {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'KMS key for Aurora encryption',
    });

    const dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'rms_admin' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });
    this.dbSecret = dbSecret;

    this.dbCluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_4,
      }),
      credentials: rds.Credentials.fromSecret(dbSecret),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 4,
      writer: rds.ClusterInstance.serverlessV2('writer'),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.rdsSg],
      storageEncrypted: true,
      storageEncryptionKey: encryptionKey,
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      backup: { retention: cdk.Duration.days(7) },
      defaultDatabaseName: 'maine_rms',
    });

    this.dbProxy = new rds.DatabaseProxy(this, 'DbProxy', {
      dbProxyName: 'maine-rms-dev-proxy',
      proxyTarget: rds.ProxyTarget.fromCluster(this.dbCluster),
      secrets: [dbSecret],
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [this.rdsSg],
      requireTLS: false,
      debugLogging: true,
    });

    new cdk.CfnOutput(this, 'DbProxyEndpoint', { value: this.dbProxy.endpoint });
    new cdk.CfnOutput(this, 'DbClusterEndpoint', { value: this.dbCluster.clusterEndpoint.hostname });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-RDS10', reason: 'Deletion protection disabled for demo environment' },
      { id: 'AwsSolutions-RDS6', reason: 'IAM auth not required for demo - using Secrets Manager credentials' },
      { id: 'AwsSolutions-SMG4', reason: 'Secret rotation configured separately via application lifecycle' },
    ]);
  }
}
