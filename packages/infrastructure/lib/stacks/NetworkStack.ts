import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.IVpc;
  public readonly albSg: ec2.SecurityGroup;
  public readonly ecsSg: ec2.SecurityGroup;
  public readonly lambdaSg: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const existingVpcId = process.env.EXISTING_VPC_ID || this.node.tryGetContext('vpcId');

    if (existingVpcId) {
      this.vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: existingVpcId });
    } else {
      this.vpc = new ec2.Vpc(this, 'Vpc', {
        maxAzs: 2,
        natGateways: 1,
        subnetConfiguration: [
          { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
          { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
          { name: 'isolated', subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
        ],
      });
    }

    this.albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc: this.vpc,
      description: 'ALB security group',
      allowAllOutbound: false,
    });
    this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    this.albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

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

    this.albSg.addEgressRule(this.ecsSg, ec2.Port.tcp(3000), 'To ECS backend');
    this.albSg.addEgressRule(this.ecsSg, ec2.Port.tcp(80), 'To ECS frontend');

    new cdk.CfnOutput(this, 'VpcId', { value: this.vpc.vpcId });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-VPC7', reason: 'Using existing VPC with its own flow logs config' },
      { id: 'AwsSolutions-EC23', reason: 'ALB requires public ingress for demo access' },
    ]);
  }
}