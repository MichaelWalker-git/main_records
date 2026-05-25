import express from 'express';
import request from 'supertest';

// Mock AWS SDKs (must be before any import that uses them)
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  InvokeModelCommand: jest.fn(),
}));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://presigned-url.example.com'),
}));
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  SendMessageCommand: jest.fn(),
}));

// Mock database
const mockDb: any = jest.fn(() => mockDb);
mockDb.raw = jest.fn().mockResolvedValue({ rows: [] });
mockDb.where = jest.fn().mockReturnValue(mockDb);
mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
mockDb.limit = jest.fn().mockResolvedValue([]);
mockDb.select = jest.fn().mockReturnValue(mockDb);
mockDb.first = jest.fn().mockResolvedValue(undefined);
mockDb.insert = jest.fn().mockResolvedValue([]);
mockDb.update = jest.fn().mockResolvedValue([]);
mockDb.del = jest.fn().mockResolvedValue(1);

jest.mock('../config/database', () => ({ db: mockDb }));

jest.mock('../config', () => ({
  config: {
    stage: 'development',
    cognito: { userPoolId: 'local-dev', clientId: '', region: 'us-east-1' },
    s3: { documentsBucket: 'test-bucket', exportsBucket: '' },
    sqs: { classifyQueueUrl: '', ocrQueueUrl: '', notificationQueueUrl: '' },
    bedrock: { modelId: '', embeddingModelId: '', region: 'us-east-1' },
    databaseUrl: 'postgresql://localhost:5432/test',
    port: 3000,
    kmsKeyArn: '',
  },
}));

import { authMiddleware } from '../middleware/auth';
import recordsRouter from '../api/records';
import { RecordsRepository } from '../repositories/RecordsRepository';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/records', recordsRouter);

// Get the actual repository instance used by the router
const repoProto = RecordsRepository.prototype;

describe('GET /api/records', () => {
  it('returns records list for authenticated user', async () => {
    jest.spyOn(repoProto, 'findAll').mockResolvedValue([
      { id: '1', title: 'Test Record', record_type: 'general' } as any,
    ]);

    const res = await request(app).get('/api/records');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Test Record');
  });

  it('respects limit and offset query params', async () => {
    const spy = jest.spyOn(repoProto, 'findAll').mockResolvedValue([]);

    await request(app).get('/api/records?limit=10&offset=20');

    expect(spy).toHaveBeenCalledWith({}, 10, 20);
  });
});

describe('GET /api/records/:id', () => {
  it('returns 404 for non-existent record', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).get('/api/records/non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Record not found');
  });

  it('returns record if found', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({
      id: 'abc-123',
      title: 'Found Record',
      agency_id: '',
    } as any);

    const res = await request(app).get('/api/records/abc-123');

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Found Record');
  });
});

describe('POST /api/records', () => {
  it('rejects invalid body (missing title)', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ description: 'no title' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects empty title', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ title: '', record_type: 'general' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/records/:id', () => {
  it('returns 404 for non-existent record', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).delete('/api/records/missing');

    expect(res.status).toBe(404);
  });

  it('deletes record successfully', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 'abc', agency_id: '' } as any);
    jest.spyOn(repoProto, 'delete').mockResolvedValue(undefined as any);

    const res = await request(app).delete('/api/records/abc');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Record deleted');
  });
});