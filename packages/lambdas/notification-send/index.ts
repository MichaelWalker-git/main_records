import { SQSEvent, SQSHandler } from "aws-lambda";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Client } from "pg";

interface NotificationMessage {
  type: string;
  recipientId: string;
  templateId: string;
  data: Record<string, string>;
}

const ses = new SESClient({});
const FROM_ADDRESS = "noreply@maine-rms.example.com";

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

function renderTemplate(
  templateId: string,
  data: Record<string, string>
): { subject: string; body: string } {
  let subject: string;
  let body: string;

  switch (templateId) {
    case "retention-alert-90":
      subject = "Record Retention Alert - 90 Days";
      body = `The record "{{recordTitle}}" is scheduled for disposition in 90 days ({{dispositionDate}}). Please review and take appropriate action.`;
      break;
    case "retention-alert-30":
      subject = "Record Retention Alert - 30 Days";
      body = `The record "{{recordTitle}}" is scheduled for disposition in 30 days ({{dispositionDate}}). Immediate review is required.`;
      break;
    case "retention-alert-7":
      subject = "URGENT: Record Retention Alert - 7 Days";
      body = `The record "{{recordTitle}}" is scheduled for disposition in 7 days ({{dispositionDate}}). Action required immediately.`;
      break;
    case "overdue-notice":
      subject = "Overdue Record Notice";
      body = `The record "{{recordTitle}}" checked out on {{checkoutDate}} was due on {{expectedReturnDate}} and is now overdue. Please return it as soon as possible.`;
      break;
    case "overdue-escalation":
      subject = "ESCALATION: Overdue Record";
      body = `The record "{{recordTitle}}" checked out by {{borrowerName}} has been overdue since {{expectedReturnDate}}. Supervisor action required.`;
      break;
    case "classification-complete":
      subject = "Record Classification Complete";
      body = `The record "{{recordTitle}}" has been classified as "{{category}}" with {{confidence}}% confidence.`;
      break;
    default:
      subject = "Maine RMS Notification";
      body = `You have a new notification regarding "{{recordTitle}}".`;
  }

  for (const [key, value] of Object.entries(data)) {
    const pattern = new RegExp(`{{${key}}}`, "g");
    subject = subject.replace(pattern, value);
    body = body.replace(pattern, value);
  }

  return { subject, body };
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  const db = await getDbClient();

  try {
    for (const record of event.Records) {
      const message: NotificationMessage = JSON.parse(record.body);

      const { rows } = await db.query(
        "SELECT email, name FROM users WHERE id = $1",
        [message.recipientId]
      );

      if (rows.length === 0) {
        console.error(`Recipient not found: ${message.recipientId}`);
        continue;
      }

      const recipient = rows[0];
      const { subject, body } = renderTemplate(message.templateId, message.data);

      await ses.send(
        new SendEmailCommand({
          Source: FROM_ADDRESS,
          Destination: {
            ToAddresses: [recipient.email],
          },
          Message: {
            Subject: { Data: subject },
            Body: {
              Text: { Data: body },
              Html: {
                Data: `<html><body><p>${body.replace(/\n/g, "<br/>")}</p></body></html>`,
              },
            },
          },
        })
      );

      await db.query(
        `INSERT INTO notifications (recipient_id, type, template_id, subject, body, data, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'SENT', NOW())`,
        [
          message.recipientId,
          message.type,
          message.templateId,
          subject,
          body,
          JSON.stringify(message.data),
        ]
      );
    }
  } catch (error) {
    console.error("Notification send error:", error);
    throw error;
  } finally {
    await db.end();
  }
};
