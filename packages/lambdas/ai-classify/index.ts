import { SQSEvent, SQSHandler } from "aws-lambda";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Client } from "pg";
import { Client as OpenSearchClient } from "@opensearch-project/opensearch";

interface ClassifyMessage {
  recordId: string;
  documentUrl: string;
}

interface ClassifyResult {
  category: string;
  tags: string[];
  confidence: number;
  reasoning: string;
}

const bedrock = new BedrockRuntimeClient({});
const s3 = new S3Client({});
const opensearch = new OpenSearchClient({
  node: process.env.OPENSEARCH_ENDPOINT,
});

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  return client;
}

async function fetchPromptFromS3(): Promise<string> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: process.env.PROMPTS_BUCKET,
      Key: "classification-prompt.txt",
    })
  );
  return await response.Body!.transformToString();
}

async function invokeClassification(
  prompt: string,
  recordMetadata: Record<string, unknown>
): Promise<ClassifyResult> {
  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nRecord metadata: ${JSON.stringify(recordMetadata)}`,
          },
        ],
        tools: [
          {
            name: "classify_record",
            description: "Classify a record with category, tags, and confidence score",
            input_schema: {
              type: "object",
              properties: {
                category: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                confidence: { type: "number" },
                reasoning: { type: "string" },
              },
              required: ["category", "tags", "confidence", "reasoning"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "classify_record" },
      }),
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const toolUseBlock = responseBody.content.find(
    (block: { type: string }) => block.type === "tool_use"
  );
  return toolUseBlock.input as ClassifyResult;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId: "amazon.titan-embed-text-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        inputText: text.substring(0, 8000),
      }),
    })
  );

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.embedding;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  const db = await getDbClient();

  try {
    for (const record of event.Records) {
      const message: ClassifyMessage = JSON.parse(record.body);

      const { rows } = await db.query(
        "SELECT * FROM records WHERE id = $1",
        [message.recordId]
      );

      if (rows.length === 0) {
        console.error(`Record not found: ${message.recordId}`);
        continue;
      }

      const recordMetadata = rows[0];
      const prompt = await fetchPromptFromS3();
      const classification = await invokeClassification(prompt, recordMetadata);

      const status =
        classification.confidence >= 0.85 ? "CLASSIFIED" : "PENDING";

      await db.query(
        `UPDATE records
         SET classification_confidence = $1,
             classification_status = $2,
             category = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          classification.confidence,
          status,
          classification.category,
          message.recordId,
        ]
      );

      for (const tag of classification.tags) {
        await db.query(
          `INSERT INTO record_tags (record_id, tag, source)
           VALUES ($1, $2, 'AI')
           ON CONFLICT (record_id, tag) DO NOTHING`,
          [message.recordId, tag]
        );
      }

      const embeddingText = `${recordMetadata.title} ${recordMetadata.description || ""} ${classification.tags.join(" ")}`;
      const embedding = await generateEmbedding(embeddingText);

      await opensearch.index({
        index: "records",
        id: message.recordId,
        body: {
          ...recordMetadata,
          category: classification.category,
          tags: classification.tags,
          classification_confidence: classification.confidence,
          classification_status: status,
          embedding,
        },
      });
    }
  } catch (error) {
    console.error("Classification error:", error);
    throw error;
  } finally {
    await db.end();
  }
};
