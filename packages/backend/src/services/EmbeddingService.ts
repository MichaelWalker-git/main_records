import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from '../config';
import { db } from '../config/database';

export class EmbeddingService {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: config.bedrock.region,
    });
    this.modelId = config.bedrock.embeddingModelId;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.send(
      new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text.slice(0, 8000), // Titan v2 limit
          dimensions: 1024,
          normalize: true,
        }),
      })
    );

    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.embedding;
  }

  async embedRecord(recordId: string): Promise<void> {
    const record = await db('records').where({ id: recordId }).first();
    if (!record) return;

    const text = [record.title, record.description, record.series_title, record.media_type]
      .filter(Boolean)
      .join(' | ');

    if (!text.trim()) return;

    const embedding = await this.generateEmbedding(text);
    const vectorStr = `[${embedding.join(',')}]`;

    await db('records')
      .where({ id: recordId })
      .update({ embedding: db.raw(`?::vector`, [vectorStr]) });
  }

  async semanticSearch(
    query: string,
    limit = 20,
    offset = 0,
    filters?: { agency_id?: string; agency?: string; status?: string }
  ) {
    const queryEmbedding = await this.generateEmbedding(query);
    const vectorStr = `[${queryEmbedding.join(',')}]`;

    let q = db('records')
      .select(
        'records.id',
        'records.title',
        'records.description',
        'records.series_title',
        'records.media_type',
        'records.status',
        'records.agency_id',
        'records.agency_code',
        'records.created_at',
        'records.location_code',
        db.raw(`1 - (embedding <=> ?::vector) as score`, [vectorStr])
      )
      .whereNotNull('records.embedding');

    if (filters?.agency_id) {
      q = q.where('records.agency_id', filters.agency_id);
    } else if (filters?.agency) {
      q = q.where('records.agency_code', filters.agency);
    }
    if (filters?.status) {
      q = q.where('records.status', filters.status);
    }

    const results = await q
      .orderByRaw(`embedding <=> ?::vector`, [vectorStr])
      .limit(limit)
      .offset(offset);

    return results;
  }
}