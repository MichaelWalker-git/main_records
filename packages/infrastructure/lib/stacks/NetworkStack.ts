import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly albSg: ec2.SecurityGroup;
  public readonly ecsSg: ec2.SecurityGroup;
  public readonly opensearchSg: ec2.SecurityGroup;
  public readonly lambdaSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const flowLogGroup = new logs.LogGroup(this, 'VpcFlowLogs', {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const flowLogRole = new iam.Role(this, 'VpcFlowLogRole', {
      assumedBy: new iam.ServicePrincipal('vpc-flow-logs.amazonaws.com'),
    });

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
        { name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
      flowLogs: {
        default: {
          destination: ec2.FlowLogDestination.toCloudWatchLogs(flowLogGroup, flowLogRole),
          trafficType: ec2.FlowLogTrafficType.ALL,
        },
      },
    });

    this.albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc: this.vpc,
      description: 'ALB security group',
      allowAllOutbound: false,
    });
    this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    this.albSg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP out');

    this.ecsSg = new ec2.SecurityGroup(this, 'EcsSg', {
      vpc: this.vpc,
      description: 'ECS tasks security group',
    });
    this.ecsSg.addIngressRule(this.albSg, ec2.Port.tcp(3000), 'From ALB backend');
    this.ecsSg.addIngressRule(this.albSg, ec2.Port.tcp(80), 'From ALB frontend');

    this.lambdaSg = new ec2.SecurityGroup(this, 'LambdaSg', {
      vpc: this.vpc,
      description: 'Lambda security group',
    });

    this.opensearchSg = new ec2.SecurityGroup(this, 'OpensearchSg', {
      vpc: this.vpc,
      description: 'OpenSearch security group',
      allowAllOutbound: false,
    });
    this.opensearchSg.addIngressRule(this.ecsSg, ec2.Port.tcp(443), 'From ECS');
    this.opensearchSg.addIngressRule(this.lambdaSg, ec2.Port.tcp(443), 'From Lambda');

    this.albSg.addEgressRule(this.ecsSg, ec2.Port.tcp(3000), 'To ECS backend');
    this.albSg.addEgressRule(this.ecsSg, ec2.Port.tcp(80), 'To ECS frontend');

    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-VPC7', reason: 'Flow logs are enabled via explicit configuration' },
      { id: 'AwsSolutions-EC23', reason: 'ALB requires public ingress for demo access' },
      { id: 'HIPAA.Security-CloudWatchLogGroupEncrypted', reason: 'Demo environment - flow log group encryption not required' },
      { id: 'HIPAA.Security-IAMNoInlinePolicy', reason: 'CDK-generated inline policy for VPC flow logs' },
      { id: 'HIPAA.Security-VPCSubnetAutoAssignPublicIpDisabled', reason: 'Public subnets required for ALB and NAT' },
      { id: 'HIPAA.Security-VPCNoUnrestrictedRouteToIGW', reason: 'Public subnets require IGW route for internet access' },
    ]);
  }
}
