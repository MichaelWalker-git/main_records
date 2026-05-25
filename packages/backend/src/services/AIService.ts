import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { config } from '../config';

export class AIService {
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({ region: config.cognito.region });
  }

  async publishClassification(recordId: string, metadata: any) {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: config.sqs.classifyQueueUrl,
        MessageBody: JSON.stringify({
          type: 'classify',
          recordId,
          metadata,
          timestamp: new Date().toISOString(),
        }),
        MessageGroupId: recordId,
      })
    );
  }

  async publishOcr(recordId: string, s3Key: string) {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: config.sqs.ocrQueueUrl,
        MessageBody: JSON.stringify({
          type: 'ocr',
          recordId,
          s3Key,
          bucket: config.s3.documentsBucket,
          timestamp: new Date().toISOString(),
        }),
        MessageGroupId: recordId,
      })
    );
  }
}
