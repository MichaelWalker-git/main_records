import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from '../config';
import { db } from '../config/database';

interface ClassifyResult {
  category: string;
  tags: string[];
  confidence: number;
  reasoning: string;
}

export class AIService {
  private sqsClient: SQSClient;
  private bedrockClient: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    this.sqsClient = new SQSClient({ region: config.cognito.region });
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.CDK_DEFAULT_REGION || config.cognito.region,
    });
    this.modelId = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-sonnet-4-20250514-v1:0';
  }

  private get useDirectBedrock(): boolean {
    return !config.sqs.classifyQueueUrl;
  }

  async publishClassification(recordId: string, metadata: any) {
    if (this.useDirectBedrock) {
      await this.classifyDirect(recordId, metadata);
      return;
    }

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
    if (this.useDirectBedrock) {
      // For local dev without SQS, just log — OCR requires S3 access
      console.log(`[AIService] OCR skipped locally for record ${recordId}, key: ${s3Key}`);
      return;
    }

    const documentUrl = `s3://${config.s3.documentsBucket}/${s3Key}`;

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: config.sqs.ocrQueueUrl,
        MessageBody: JSON.stringify({
          recordId,
          documentUrl,
        }),
      })
    );
  }

  private async classifyDirect(recordId: string, metadata: any): Promise<void> {
    const prompt = `You are a government records classification specialist for the State of Maine Archives.
Classify this record based on its metadata. Determine the appropriate category, relevant tags, and your confidence level.

Categories: correspondence, legal_document, financial_record, report, memorandum, legislation, meeting_minutes, certificate, form, photograph, map, other

Record metadata: ${JSON.stringify(metadata)}`;

    const response = await this.bedrockClient.send(
      new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
          tools: [
            {
              name: 'classify_record',
              description: 'Classify a record with category, tags, and confidence score',
              input_schema: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  confidence: { type: 'number' },
                  reasoning: { type: 'string' },
                },
                required: ['category', 'tags', 'confidence', 'reasoning'],
              },
            },
          ],
          tool_choice: { type: 'tool', name: 'classify_record' },
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const toolUseBlock = responseBody.content.find(
      (block: { type: string }) => block.type === 'tool_use'
    );

    if (!toolUseBlock) {
      throw new Error('Bedrock did not return tool_use response');
    }

    const classification: ClassifyResult = toolUseBlock.input;
    const status = classification.confidence >= 0.85 ? 'CLASSIFIED' : 'PENDING';

    // Update record with classification results
    await db('records')
      .where({ id: recordId })
      .update({
        classification_confidence: classification.confidence,
        classification_status: status,
        category: classification.category,
        updated_at: new Date(),
      });

    // Store tags
    for (const tag of classification.tags) {
      await db('record_tags')
        .insert({ record_id: recordId, tag })
        .onConflict(['record_id', 'tag'])
        .ignore();
    }

    // Audit event
    await db('audit_events').insert({
      event_type: 'AI_CLASSIFICATION',
      entity_type: 'record',
      entity_id: recordId,
      metadata: JSON.stringify({
        category: classification.category,
        confidence: classification.confidence,
        tags: classification.tags,
        reasoning: classification.reasoning,
        source: 'direct-bedrock',
      }),
      created_at: new Date(),
    });

    console.log(
      `[AIService] Classified record ${recordId}: category=${classification.category}, confidence=${classification.confidence}`
    );
  }
}
