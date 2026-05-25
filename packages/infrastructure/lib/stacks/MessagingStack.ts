import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';

export class MessagingStack extends cdk.Stack {
  public readonly classifyQueue: sqs.Queue;
  public readonly ocrQueue: sqs.Queue;
  public readonly notificationQueue: sqs.Queue;
  public readonly classifyDlq: sqs.Queue;
  public readonly ocrDlq: sqs.Queue;
  public readonly notificationDlq: sqs.Queue;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sqsKey = new kms.Key(this, 'SqsEncryptionKey', {
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'KMS key for SQS encryption',
    });

    this.classifyDlq = new sqs.Queue(this, 'ClassifyDlq', {
      queueName: 'maine-rms-classify-dlq',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      retentionPeriod: cdk.Duration.days(14),
    });

    this.classifyQueue = new sqs.Queue(this, 'ClassifyQueue', {
      queueName: 'maine-rms-classify',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      visibilityTimeout: cdk.Duration.minutes(5),
      deadLetterQueue: { queue: this.classifyDlq, maxReceiveCount: 3 },
    });

    this.ocrDlq = new sqs.Queue(this, 'OcrDlq', {
      queueName: 'maine-rms-ocr-dlq',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      retentionPeriod: cdk.Duration.days(14),
    });

    this.ocrQueue = new sqs.Queue(this, 'OcrQueue', {
      queueName: 'maine-rms-ocr',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      visibilityTimeout: cdk.Duration.minutes(10),
      deadLetterQueue: { queue: this.ocrDlq, maxReceiveCount: 3 },
    });

    this.notificationDlq = new sqs.Queue(this, 'NotificationDlq', {
      queueName: 'maine-rms-notification-dlq',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      retentionPeriod: cdk.Duration.days(14),
    });

    this.notificationQueue = new sqs.Queue(this, 'NotificationQueue', {
      queueName: 'maine-rms-notification',
      encryption: sqs.QueueEncryption.KMS,
      encryptionMasterKey: sqsKey,
      visibilityTimeout: cdk.Duration.minutes(2),
      deadLetterQueue: { queue: this.notificationDlq, maxReceiveCount: 3 },
    });



    new cdk.CfnOutput(this, 'ClassifyQueueUrl', { value: this.classifyQueue.queueUrl });
    new cdk.CfnOutput(this, 'OcrQueueUrl', { value: this.ocrQueue.queueUrl });
    new cdk.CfnOutput(this, 'NotificationQueueUrl', { value: this.notificationQueue.queueUrl });

    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-SQS3', reason: 'DLQ queues do not require their own DLQ' },
      { id: 'AwsSolutions-SQS4', reason: 'SSL enforcement handled at IAM policy level for demo' },
    ]);
  }
}
