import { SQSEvent, SQSHandler } from "aws-lambda";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Client } from "pg";

/**
 * AI-powered document OCR using Claude Vision (Bedrock).
 * Same approach as our production IDP pipeline (rudy-paystub-processor / vrc-idp):
 * - Fetches document/image from S3
 * - Sends to Claude Vision for text extraction + structured analysis
 * - Supports PDF (native Bedrock document support) and images (base64 vision)
 * - Stores extracted text in PostgreSQL (indexed via tsvector for search)
 * - Forwards to classify queue for AI classification
 */

interface OcrMessage {
  recordId: string;
  documentUrl: string;
}

interface ExtractionResult {
  extractedText: string;
  documentType: string;
  confidence: number;
  metadata: {
    pageCount: number;
    hasHandwriting: boolean;
    language: string;
  };
}

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  maxAttempts: 3,
});
const s3 = new S3Client({});
const sqs = new SQSClient({});

const EXTRACTION_PROMPT = `You are a government records document extraction specialist for the State of Maine Archives.
Extract ALL text content from this document. This is for a Records Management System.

## Extraction Rules
1. Extract ALL visible text, preserving document structure (headings, paragraphs, lists, tables)
2. For tables: preserve column alignment using tab separators
3. For forms: extract field labels and their values as "Label: Value" pairs
4. Preserve dates, reference numbers, case numbers, and identifiers exactly as printed
5. Note any stamps, signatures, or annotations as [STAMP: text] or [SIGNATURE: description]
6. If text is partially obscured, extract what is readable and note "[unclear]" for illegible portions
7. For handwritten text, transcribe as-is and mark with [handwritten] prefix
8. Preserve page breaks as "--- Page N ---"

## Document Analysis
Also determine:
- Document type (correspondence, form, report, legal_document, memorandum, certificate, photograph, map, financial_record, meeting_minutes, legislation, other)
- Whether it contains handwriting
- Primary language
- Estimated page count

Use the extract_document_content tool to return structured results.`;

const TOOL_SCHEMA = {
  name: "extract_document_content",
  description: "Extract text content and metadata from a government records document",
  input_schema: {
    type: "object",
    properties: {
      extracted_text: {
        type: "string",
        description: "Full extracted text content preserving structure",
      },
      document_type: {
        type: "string",
        enum: [
          "correspondence", "form", "report", "legal_document",
          "memorandum", "certificate", "photograph", "map",
          "financial_record", "meeting_minutes", "legislation", "other",
        ],
        description: "Type of government document",
      },
      confidence: {
        type: "number",
        description: "Extraction confidence 0-100",
      },
      page_count: {
        type: "number",
        description: "Number of pages in document",
      },
      has_handwriting: {
        type: "boolean",
        description: "Whether document contains handwritten text",
      },
      language: {
        type: "string",
        description: "Primary language (e.g., en, fr)",
      },
    },
    required: ["extracted_text", "document_type", "confidence", "page_count", "has_handwriting", "language"],
  },
};

function parseS3Url(documentUrl: string): { bucket: string; key: string } {
  if (documentUrl.startsWith("s3://")) {
    const parts = documentUrl.replace("s3://", "").split("/");
    return { bucket: parts[0], key: parts.slice(1).join("/") };
  }
  const url = new URL(documentUrl);
  return { bucket: url.hostname.split(".")[0], key: url.pathname.slice(1) };
}

async function fetchDocumentFromS3(documentUrl: string): Promise<{ data: Buffer; contentType: string }> {
  const { bucket, key } = parseS3Url(documentUrl);
  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const bodyBytes = await response.Body!.transformToByteArray();
  return {
    data: Buffer.from(bodyBytes),
    contentType: response.ContentType || "application/octet-stream",
  };
}

function isPdf(contentType: string): boolean {
  return contentType.includes("pdf");
}

function isImage(contentType: string): boolean {
  return contentType.includes("image/");
}

function getMediaType(contentType: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (contentType.includes("png")) return "image/png";
  if (contentType.includes("webp")) return "image/webp";
  if (contentType.includes("gif")) return "image/gif";
  return "image/jpeg";
}

/**
 * Extract from PDF using Bedrock's native document support.
 * Claude can process PDF files directly as base64-encoded documents.
 */
async function extractFromPdf(pdfData: Buffer): Promise<ExtractionResult> {
  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 16384,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfData.toString("base64"),
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "tool", name: "extract_document_content" },
      }),
    })
  );

  return parseToolResponse(response);
}

/**
 * Extract from image using Claude Vision (base64 image).
 */
async function extractFromImage(imageData: Buffer, contentType: string): Promise<ExtractionResult> {
  const mediaType = getMediaType(contentType);

  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageData.toString("base64"),
                },
              },
              {
                type: "text",
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "tool", name: "extract_document_content" },
      }),
    })
  );

  return parseToolResponse(response);
}

function parseToolResponse(response: any): ExtractionResult {
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  const toolUseBlock = responseBody.content.find(
    (block: { type: string }) => block.type === "tool_use"
  );

  if (!toolUseBlock) {
    throw new Error("Claude did not return tool_use response");
  }

  const input = toolUseBlock.input;
  return {
    extractedText: input.extracted_text,
    documentType: input.document_type,
    confidence: input.confidence,
    metadata: {
      pageCount: input.page_count,
      hasHandwriting: input.has_handwriting,
      language: input.language,
    },
  };
}

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const endpoint = process.env.DB_PROXY_ENDPOINT;
  const port = process.env.DB_PORT || "5433";
  if (endpoint && process.env.DB_SECRET) {
    try {
      const secret = JSON.parse(process.env.DB_SECRET);
      return `postgresql://${secret.username}:${secret.password}@${endpoint}:${port}/maine_rms?sslmode=require`;
    } catch { /* fallback */ }
  }
  if (endpoint) return `postgresql://${endpoint}:${port}/maine_rms?sslmode=require`;
  return "postgresql://localhost:5432/maine_rms";
}

async function getDbClient(): Promise<Client> {
  const client = new Client({ connectionString: buildDatabaseUrl() });
  await client.connect();
  return client;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  const db = await getDbClient();

  try {
    for (const record of event.Records) {
      const message: OcrMessage = JSON.parse(record.body);
      console.log(`Processing OCR for record ${message.recordId}, doc: ${message.documentUrl}`);

      // Fetch document from S3
      const { data, contentType } = await fetchDocumentFromS3(message.documentUrl);
      let result: ExtractionResult;

      if (isPdf(contentType)) {
        // PDF: use Bedrock native document support (up to ~100 pages)
        console.log(`PDF detected (${(data.length / 1024 / 1024).toFixed(1)}MB), using native document processing`);
        result = await extractFromPdf(data);
      } else if (isImage(contentType)) {
        // Image: use Claude Vision
        console.log(`Image detected (${contentType}), using Vision API`);
        result = await extractFromImage(data, contentType);
      } else {
        // Unsupported format
        console.warn(`Unsupported content type: ${contentType}`);
        result = {
          extractedText: `[Unsupported document format: ${contentType}]`,
          documentType: "other",
          confidence: 0,
          metadata: { pageCount: 0, hasHandwriting: false, language: "en" },
        };
      }

      // Store extracted text in PostgreSQL (indexed by search_vector tsvector)
      await db.query(
        `UPDATE records
         SET description = CASE
           WHEN description IS NULL OR description = '' THEN $1
           ELSE description || E'\n\n--- Extracted Content ---\n' || $1
         END,
         media_type = COALESCE(NULLIF(media_type, ''), $2),
         updated_at = NOW()
         WHERE id = $3`,
        [result.extractedText, result.documentType, message.recordId]
      );

      // Generate embedding for semantic search
      // (handled async by backend EmbeddingService on next access, or can be triggered here)

      // Send to classification queue
      if (process.env.CLASSIFY_QUEUE_URL) {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: process.env.CLASSIFY_QUEUE_URL,
            MessageBody: JSON.stringify({
              type: "classify",
              recordId: message.recordId,
              metadata: {
                title: result.extractedText.slice(0, 200),
                description: result.extractedText,
                documentType: result.documentType,
              },
              timestamp: new Date().toISOString(),
            }),
          })
        );
      }

      // Audit trail
      await db.query(
        `INSERT INTO audit_events (event_type, entity_type, entity_id, metadata, created_at)
         VALUES ('OCR_PROCESSED', 'record', $1, $2, NOW())`,
        [
          message.recordId,
          JSON.stringify({
            source: "claude-vision",
            documentType: result.documentType,
            confidence: result.confidence,
            textLength: result.extractedText.length,
            contentType,
            fileSizeMB: (data.length / 1024 / 1024).toFixed(2),
            ...result.metadata,
          }),
        ]
      );

      console.log(
        `Completed record ${message.recordId}: type=${result.documentType}, confidence=${result.confidence}, pages=${result.metadata.pageCount}, text=${result.extractedText.length} chars`
      );
    }
  } catch (error) {
    console.error("OCR processing error:", error);
    throw error; // Let SQS retry / send to DLQ
  } finally {
    await db.end();
  }
};