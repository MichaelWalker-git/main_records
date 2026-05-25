import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export interface SearchStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  opensearchSg: ec2.SecurityGroup;
}

export class SearchStack extends cdk.Stack {
  public readonly domain: opensearch.Domain;

  constructor(scope: Construct, id: string, props: SearchStackProps) {
    super(scope, id, props);

    this.domain = new opensearch.Domain(this, 'OpenSearchDomain', {
      domainName: 'maine-rms-search',
      version: opensearch.EngineVersion.OPENSEARCH_2_11,
      vpc: props.vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, onePerAz: true }],
      securityGroups: [props.opensearchSg],
      capacity: {
        dataNodes: 1,
        dataNodeInstanceType: 't3.medium.search',
      },
      ebs: {
        volumeSize: 50,
        volumeType: ec2.EbsDeviceVolumeType.GP3,
      },
      encryptionAtRest: { enabled: true },
      nodeToNodeEncryption: true,
      enforceHttps: true,
      tlsSecurityPolicy: opensearch.TLSSecurityPolicy.TLS_1_2,
      zoneAwareness: { enabled: false },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      accessPolicies: [
        new iam.PolicyStatement({
          actions: ['es:ESHttp*'],
          principals: [new iam.AccountRootPrincipal()],
          resources: ['*'],
        }),
      ],
    });

    new cdk.CfnOutput(this, 'OpenSearchEndpoint', { value: this.domain.domainEndpoint });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-OS3', reason: 'Single-node demo deployment does not require zone awareness' },
      { id: 'AwsSolutions-OS4', reason: 'Dedicated master nodes not needed for single-node demo' },
      { id: 'AwsSolutions-OS5', reason: 'Access restricted via VPC and security groups' },
      { id: 'AwsSolutions-OS7', reason: 'Single-node demo does not require zone awareness' },
      { id: 'AwsSolutions-OS9', reason: 'Slow logs configured via domain properties for demo' },
      { id: 'AwsSolutions-IAM5', reason: 'Resource wildcard scoped to domain via access policy' },
      { id: 'AwsSolutions-IAM4', reason: 'AWS managed execution role for CDK custom resource Lambda' },
      { id: 'AwsSolutions-L1', reason: 'CDK custom resource Lambda runtime managed by framework' },
    ]);
  }
}
