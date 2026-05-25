import { ScheduledHandler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Client } from "pg";

const sqs = new SQSClient({});

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

const THRESHOLDS = [90, 30, 7] as const;

export const handler: ScheduledHandler = async () => {
  const db = await getDbClient();

  try {
    const today = new Date();
    const future90 = new Date(today);
    future90.setDate(future90.getDate() + 90);

    const { rows: upcomingRecords } = await db.query(
      `SELECT r.id, r.title, r.disposition_date, r.custodian_id
       FROM records r
       WHERE r.disposition_date BETWEEN $1 AND $2
       AND r.disposition_status != 'COMPLETED'`,
      [today.toISOString(), future90.toISOString()]
    );

    for (const record of upcomingRecords) {
      const daysUntilDisposition = Math.ceil(
        (new Date(record.disposition_date).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      for (const threshold of THRESHOLDS) {
        if (daysUntilDisposition > threshold) continue;

        const { rows: existingAlerts } = await db.query(
          `SELECT id FROM schedule_alerts
           WHERE record_id = $1 AND threshold_days = $2`,
          [record.id, threshold]
        );

        if (existingAlerts.length > 0) continue;

        await db.query(
          `INSERT INTO schedule_alerts (record_id, threshold_days, alert_type, created_at)
           VALUES ($1, $2, 'RETENTION', NOW())`,
          [record.id, threshold]
        );

        const templateId = `retention-alert-${threshold}`;

        await sqs.send(
          new SendMessageCommand({
            QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
            MessageBody: JSON.stringify({
              type: "RETENTION_ALERT",
              recipientId: record.custodian_id,
              templateId,
              data: {
                recordTitle: record.title,
                dispositionDate: new Date(
                  record.disposition_date
                ).toLocaleDateString(),
                daysRemaining: String(daysUntilDisposition),
              },
            }),
          })
        );
      }
    }

    const { rows: overdueRecords } = await db.query(
      `SELECT r.id, r.title, r.disposition_date, r.custodian_id
       FROM records r
       WHERE r.disposition_date < $1
       AND r.disposition_status != 'COMPLETED'
       AND NOT EXISTS (
         SELECT 1 FROM schedule_alerts sa
         WHERE sa.record_id = r.id AND sa.alert_type = 'OVERDUE'
       )`,
      [today.toISOString()]
    );

    for (const record of overdueRecords) {
      await db.query(
        `INSERT INTO schedule_alerts (record_id, threshold_days, alert_type, created_at)
         VALUES ($1, 0, 'OVERDUE', NOW())`,
        [record.id]
      );

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
          MessageBody: JSON.stringify({
            type: "RETENTION_OVERDUE",
            recipientId: record.custodian_id,
            templateId: "retention-overdue",
            data: {
              recordTitle: record.title,
              dispositionDate: new Date(
                record.disposition_date
              ).toLocaleDateString(),
            },
          }),
        })
      );
    }
  } catch (error) {
    console.error("Retention alerts error:", error);
    throw error;
  } finally {
    await db.end();
  }
};
