import express from 'express';
import request from 'supertest';

jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  InvokeModelCommand: jest.fn(),
}));

const mockDb: any = jest.fn(() => mockDb);
mockDb.raw = jest.fn().mockResolvedValue({ rows: [] });
mockDb.where = jest.fn().mockReturnValue(mockDb);

jest.mock('../config/database', () => ({ db: mockDb }));
jest.mock('../config', () => ({
  config: {
    stage: 'development',
    cognito: { userPoolId: 'local-dev', clientId: '', region: 'us-east-1' },
    s3: { documentsBucket: 'test-bucket', exportsBucket: '' },
    sqs: { classifyQueueUrl: '', ocrQueueUrl: '', notificationQueueUrl: '' },
    bedrock: { modelId: 'anthropic.claude-3-5-sonnet', embeddingModelId: 'amazon.titan-embed-text-v2:0', region: 'us-east-1' },
    databaseUrl: 'postgresql://localhost:5432/test',
    port: 3000,
    kmsKeyArn: '',
  },
}));

jest.mock('../services/SearchService', () => ({
  SearchService: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue({ results: [], total: 0, page: 1, size: 20 }),
    getFacets: jest.fn().mockResolvedValue({ record_types: [], agencies: [], statuses: [] }),
  })),
}));

import { authMiddleware } from '../middleware/auth';
import searchRouter from '../api/search';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/search', searchRouter);

describe('POST /api/search', () => {
  it('rejects empty query', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects missing query', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({});

    expect(res.status).toBe(400);
  });

  it('accepts valid search with metadata type', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: 'test records', type: 'metadata' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('results');
  });

  it('accepts valid search with fulltext type', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: 'budget report', type: 'fulltext' });

    expect(res.status).toBe(200);
  });

  it('rejects invalid search type', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: 'test', type: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('rejects page size over 100', async () => {
    const res = await request(app)
      .post('/api/search')
      .send({ query: 'test', size: 200 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/search/facets', () => {
  it('returns facets', async () => {
    const res = await request(app).get('/api/search/facets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('record_types');
  });
});