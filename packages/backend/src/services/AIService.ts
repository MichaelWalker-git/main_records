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
    // Always try direct Bedrock classification first (synchronous for better UX)
    try {
      await this.classifyDirect(recordId, metadata);
      return;
    } catch (err) {
      console.warn(`[AIService] Direct classification failed for ${recordId}, falling back:`, (err as Error).message);
    }

    // Fallback: if SQS available, queue for async processing
    if (config.sqs.classifyQueueUrl) {
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
      return;
    }

    // Final fallback: mock classification for demo
    await this.classifyMock(recordId, metadata);
  }

  private async classifyMock(recordId: string, metadata: any): Promise<void> {
    // Deterministic mock classification based on record title/description
    const text = `${metadata.title || ''} ${metadata.description || ''}`.toLowerCase();
    let category = 'other';
    let seriesTitle = 'General Records';

    if (text.includes('permit') || text.includes('license') || text.includes('certificate')) {
      category = 'certificate'; seriesTitle = 'Certificates & Licenses';
    } else if (text.includes('financial') || text.includes('budget') || text.includes('invoice') || text.includes('payment')) {
      category = 'financial_record'; seriesTitle = 'Financial Records';
    } else if (text.includes('meeting') || text.includes('minutes') || text.includes('agenda')) {
      category = 'meeting_minutes'; seriesTitle = 'Meeting Minutes';
    } else if (text.includes('report') || text.includes('study') || text.includes('analysis')) {
      category = 'report'; seriesTitle = 'Reports & Studies';
    } else if (text.includes('memo') || text.includes('memorandum')) {
      category = 'memorandum'; seriesTitle = 'Internal Memoranda';
    } else if (text.includes('law') || text.includes('regulation') || text.includes('statute') || text.includes('legislation')) {
      category = 'legislation'; seriesTitle = 'Legislation & Regulations';
    } else if (text.includes('letter') || text.includes('correspondence') || text.includes('email')) {
      category = 'correspondence'; seriesTitle = 'General Correspondence';
    } else if (text.includes('map') || text.includes('plan') || text.includes('survey') || text.includes('environmental')) {
      category = 'map'; seriesTitle = 'Maps & Plans';
    } else if (text.includes('photo') || text.includes('image')) {
      category = 'photograph'; seriesTitle = 'Photographs & Media';
    } else if (text.includes('legal') || text.includes('contract') || text.includes('agreement')) {
      category = 'legal_document'; seriesTitle = 'Legal Documents';
    }

    const tags = [category, 'auto-classified'];

    await db('records')
      .where({ id: recordId })
      .update({
        ai_confidence: 0.75,
        classification_status: 'CLASSIFIED',
        ai_tags: JSON.stringify([category, ...tags]),
        series_title: seriesTitle,
        updated_at: new Date(),
      });

    // Insert tags (skip duplicates)
    for (const tag of tags) {
      const exists = await db('record_tags').where({ record_id: recordId, tag }).first();
      if (!exists) {
        await db('record_tags').insert({ record_id: recordId, tag });
      }
    }

    await db('audit_events').insert({
      action: 'AI_CLASSIFICATION',
      resource_type: 'record',
      resource_id: recordId,
      metadata: JSON.stringify({
        category,
        confidence: 0.75,
        tags,
        reasoning: 'Mock classification based on keyword analysis (Bedrock unavailable)',
        source: 'mock-fallback',
      }),
      user_email: 'system@maine-rms.gov',
    });
  }

  async publishOcr(recordId: string, s3Key: string) {
    // Always try direct OCR first (synchronous for better UX in PoC)
    try {
      await this.ocrDirect(recordId, s3Key);
      return;
    } catch (err) {
      console.warn(`[AIService] Direct OCR failed for ${recordId}:`, (err as Error).message);
    }

    // Fallback: SQS queue for Lambda processing
    if (config.sqs.ocrQueueUrl) {
      const documentUrl = `s3://${config.s3.documentsBucket}/${s3Key}`;
      await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: config.sqs.ocrQueueUrl,
          MessageBody: JSON.stringify({ recordId, documentUrl }),
        })
      );
      return;
    }

    console.log(`[AIService] OCR skipped for record ${recordId} — no Bedrock or SQS available`);
  }

  private async ocrDirect(recordId: string, s3Key: string): Promise<void> {
    const { S3Client: S3C, GetObjectCommand: GetObj } = await import('@aws-sdk/client-s3');
    const s3 = new S3C({ region: config.bedrock.region });

    // Fetch document from S3
    const obj = await s3.send(new GetObj({
      Bucket: config.s3.documentsBucket,
      Key: s3Key,
    }));

    const bodyBytes = await obj.Body!.transformToByteArray();
    const contentType = obj.ContentType || 'application/pdf';
    const base64 = Buffer.from(bodyBytes).toString('base64');

    // Determine media type for Claude Vision
    let mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'application/pdf' = 'application/pdf';
    if (contentType.includes('png')) mediaType = 'image/png';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) mediaType = 'image/jpeg';
    else if (contentType.includes('gif')) mediaType = 'image/gif';
    else if (contentType.includes('webp')) mediaType = 'image/webp';

    // Use Claude Vision to extract text
    const isPdf = mediaType === 'application/pdf';
    const content: any[] = [
      {
        type: isPdf ? 'document' : 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      },
      {
        type: 'text',
        text: 'Extract ALL text content from this document. Return the full text exactly as it appears, preserving structure. If there are tables, format them clearly. Include all dates, names, reference numbers, and key details.',
      },
    ];

    const response = await this.bedrockClient.send(
      new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 8192,
          messages: [{ role: 'user', content }],
        }),
      })
    );

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const extractedText = responseBody.content
      ?.filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n') || '';

    if (!extractedText) {
      console.warn(`[AIService] OCR returned empty text for ${recordId}`);
      return;
    }

    // Update record with extracted text
    await db('records')
      .where({ id: recordId })
      .update({
        description: extractedText.slice(0, 10000), // limit to 10k chars
        updated_at: new Date(),
      });

    // Audit event
    await db('audit_events').insert({
      action: 'OCR_EXTRACTION',
      resource_type: 'record',
      resource_id: recordId,
      metadata: JSON.stringify({
        s3Key,
        extractedLength: extractedText.length,
        source: 'direct-bedrock-vision',
      }),
      user_email: 'system@maine-rms.gov',
    });

    // Auto-classify after OCR
    const record = await db('records').where({ id: recordId }).first();
    if (record) {
      await this.publishClassification(recordId, record);
    }
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

    // Map category to a human-readable series title
    const seriesTitleMap: Record<string, string> = {
      correspondence: 'General Correspondence',
      legal_document: 'Legal Documents',
      financial_record: 'Financial Records',
      report: 'Reports & Studies',
      memorandum: 'Internal Memoranda',
      legislation: 'Legislation & Regulations',
      meeting_minutes: 'Meeting Minutes',
      certificate: 'Certificates & Licenses',
      form: 'Administrative Forms',
      photograph: 'Photographs & Media',
      map: 'Maps & Plans',
      other: 'General Records',
    };
    const seriesTitle = seriesTitleMap[classification.category] || 'General Records';

    // Update record with classification results
    await db('records')
      .where({ id: recordId })
      .update({
        ai_confidence: classification.confidence,
        classification_status: status,
        ai_tags: JSON.stringify(classification.tags),
        series_title: seriesTitle,
        updated_at: new Date(),
      });

    // Store tags (skip duplicates)
    for (const tag of classification.tags) {
      const exists = await db('record_tags').where({ record_id: recordId, tag }).first();
      if (!exists) {
        await db('record_tags').insert({ record_id: recordId, tag });
      }
    }

    // Audit event
    await db('audit_events').insert({
      action: 'AI_CLASSIFICATION',
      resource_type: 'record',
      resource_id: recordId,
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
