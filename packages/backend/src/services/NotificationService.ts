import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Knex } from 'knex';
import { config } from '../config';

export class NotificationService {
  private sqsClient: SQSClient;

  constructor(private db: Knex) {
    this.sqsClient = new SQSClient({ region: config.cognito.region });
  }

  async send(eventType: string, payload: any, userId?: string) {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: config.sqs.notificationQueueUrl,
        MessageBody: JSON.stringify({
          eventType,
          payload,
          userId,
          timestamp: new Date().toISOString(),
        }),
      })
    );

    if (userId) {
      await this.db('notifications').insert({
        user_id: userId,
        type: eventType,
        title: eventType.replace(/_/g, ' '),
        message: JSON.stringify(payload),
        is_read: false,
        created_at: new Date(),
      });
    }
  }

  async getInAppNotifications(userId: string, unreadOnly = false) {
    let query = this.db('notifications').where({ user_id: userId });
    if (unreadOnly) query = query.where({ is_read: false });
    return query.orderBy('created_at', 'desc').limit(50);
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.db('notifications')
      .where({ id: notificationId, user_id: userId })
      .update({ is_read: true });
  }
}
