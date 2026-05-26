import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export class StorageStack extends cdk.Stack {
  public readonly documentsBucket: s3.Bucket;
  public readonly exportsBucket: s3.Bucket;
  public readonly promptsBucket: s3.Bucket;
  public readonly accessLogsBucket: s3.Bucket;
  public readonly encryptionKey: kms.Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.encryptionKey = new kms.Key(this, 'StorageKey', {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'KMS CMK for S3 bucket encryption',
    });

    this.accessLogsBucket = new s3.Bucket(this, 'AccessLogsBucket', {
      bucketName: `maine-rms-access-logs-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    this.documentsBucket = new s3.Bucket(this, 'DocumentsBucket', {
      bucketName: `maine-rms-documents-${this.account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: this.accessLogsBucket,
      serverAccessLogsPrefix: 'documents/',
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3600,
        },
      ],
    });

    this.exportsBucket = new s3.Bucket(this, 'ExportsBucket', {
      bucketName: `maine-rms-exports-${this.account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: this.accessLogsBucket,
      serverAccessLogsPrefix: 'exports/',
    });

    this.promptsBucket = new s3.Bucket(this, 'PromptsBucket', {
      bucketName: `maine-rms-prompts-${this.account}`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: this.accessLogsBucket,
      serverAccessLogsPrefix: 'prompts/',
    });

    new cdk.CfnOutput(this, 'DocumentsBucketName', { value: this.documentsBucket.bucketName });
    new cdk.CfnOutput(this, 'ExportsBucketName', { value: this.exportsBucket.bucketName });
    new cdk.CfnOutput(this, 'PromptsBucketName', { value: this.promptsBucket.bucketName });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-S1', reason: 'Access logs bucket does not need its own access logging' },
    ]);
  }
}
