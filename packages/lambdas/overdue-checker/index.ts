import { ScheduledHandler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Client } from "pg";

const sqs = new SQSClient({});

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

export const handler: ScheduledHandler = async () => {
  const db = await getDbClient();

  try {
    const today = new Date().toISOString().split("T")[0];

    const { rows: overdueEvents } = await db.query(
      `SELECT ce.id, ce.record_id, ce.borrower_id, ce.expected_return_date, ce.supervisor_id,
              r.title AS record_title,
              u.name AS borrower_name
       FROM circulation_events ce
       JOIN records r ON r.id = ce.record_id
       JOIN users u ON u.id = ce.borrower_id
       WHERE ce.type = 'CHECKOUT'
       AND ce.actual_return_date IS NULL
       AND ce.expected_return_date < $1`,
      [today]
    );

    for (const event of overdueEvents) {
      const expectedDate = new Date(event.expected_return_date);
      const todayDate = new Date(today);
      const daysOverdue = Math.ceil(
        (todayDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue === 1) {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
            MessageBody: JSON.stringify({
              type: "OVERDUE_NOTICE",
              recipientId: event.borrower_id,
              templateId: "overdue-notice",
              data: {
                recordTitle: event.record_title,
                checkoutDate: event.expected_return_date,
                expectedReturnDate: new Date(
                  event.expected_return_date
                ).toLocaleDateString(),
              },
            }),
          })
        );
      }

      if (daysOverdue >= 7) {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
            MessageBody: JSON.stringify({
              type: "OVERDUE_ESCALATION",
              recipientId: event.supervisor_id,
              templateId: "overdue-escalation",
              data: {
                recordTitle: event.record_title,
                borrowerName: event.borrower_name,
                expectedReturnDate: new Date(
                  event.expected_return_date
                ).toLocaleDateString(),
                daysOverdue: String(daysOverdue),
              },
            }),
          })
        );
      }

      await db.query(
        `UPDATE circulation_events SET is_overdue = true WHERE id = $1`,
        [event.id]
      );
    }
  } catch (error) {
    console.error("Overdue checker error:", error);
    throw error;
  } finally {
    await db.end();
  }
};
