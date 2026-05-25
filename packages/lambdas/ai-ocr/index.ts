import { SQSEvent, SQSHandler } from "aws-lambda";
import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
  Block,
} from "@aws-sdk/client-textract";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Client } from "pg";

interface OcrMessage {
  recordId: string;
  documentUrl: string;
}

const textract = new TextractClient({});
const sqs = new SQSClient({});

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

function parseS3Url(url: string): { bucket: string; key: string } {
  const parsed = new URL(url);
  const bucket = parsed.hostname.split(".")[0];
  const key = parsed.pathname.slice(1);
  return { bucket, key };
}

async function waitForTextDetection(jobId: string): Promise<Block[]> {
  const maxWaitMs = 300000;
  const startTime = Date.now();
  let delay = 1000;
  let allBlocks: Block[] = [];

  while (Date.now() - startTime < maxWaitMs) {
    let nextToken: string | undefined;

    const response = await textract.send(
      new GetDocumentTextDetectionCommand({ JobId: jobId })
    );

    if (response.JobStatus === "FAILED") {
      throw new Error(`Textract job failed: ${response.StatusMessage}`);
    }

    if (response.JobStatus === "SUCCEEDED") {
      allBlocks = allBlocks.concat(response.Blocks || []);
      nextToken = response.NextToken;

      while (nextToken) {
        const nextResponse = await textract.send(
          new GetDocumentTextDetectionCommand({
            JobId: jobId,
            NextToken: nextToken,
          })
        );
        allBlocks = allBlocks.concat(nextResponse.Blocks || []);
        nextToken = nextResponse.NextToken;
      }

      return allBlocks;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, 10000);
  }

  throw new Error("Textract job timed out after 5 minutes");
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  const db = await getDbClient();

  try {
    for (const record of event.Records) {
      const message: OcrMessage = JSON.parse(record.body);
      const { bucket, key } = parseS3Url(message.documentUrl);

      const startResponse = await textract.send(
        new StartDocumentTextDetectionCommand({
          DocumentLocation: {
            S3Object: { Bucket: bucket, Name: key },
          },
        })
      );

      const jobId = startResponse.JobId!;
      const blocks = await waitForTextDetection(jobId);

      const lineBlocks = blocks
        .filter((block) => block.BlockType === "LINE")
        .sort((a, b) => {
          const pageA = a.Page || 1;
          const pageB = b.Page || 1;
          if (pageA !== pageB) return pageA - pageB;
          const topA = a.Geometry?.BoundingBox?.Top || 0;
          const topB = b.Geometry?.BoundingBox?.Top || 0;
          return topA - topB;
        });

      const ocrText = lineBlocks.map((block) => block.Text).join("\n");

      await db.query(
        `UPDATE records SET ocr_text = $1, updated_at = NOW() WHERE id = $2`,
        [ocrText, message.recordId]
      );

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: process.env.CLASSIFY_QUEUE_URL,
          MessageBody: JSON.stringify({
            recordId: message.recordId,
            documentUrl: message.documentUrl,
          }),
        })
      );

      const { Client: OpenSearchClient } = await import(
        "@opensearch-project/opensearch"
      );
      const opensearch = new OpenSearchClient({
        node: process.env.OPENSEARCH_ENDPOINT,
      });

      await opensearch.update({
        index: "records",
        id: message.recordId,
        body: {
          doc: { ocr_text: ocrText },
        },
      });
    }
  } catch (error) {
    console.error("OCR processing error:", error);
    throw error;
  } finally {
    await db.end();
  }
};
