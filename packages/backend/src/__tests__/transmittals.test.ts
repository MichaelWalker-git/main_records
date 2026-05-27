import express from 'express';
import request from 'supertest';

jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  SendMessageCommand: jest.fn(),
}));

const mockDb: any = jest.fn(() => mockDb);
mockDb.raw = jest.fn().mockResolvedValue({ rows: [] });
mockDb.where = jest.fn().mockReturnValue(mockDb);
mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
mockDb.limit = jest.fn().mockResolvedValue([]);
mockDb.select = jest.fn().mockReturnValue(mockDb);
mockDb.leftJoin = jest.fn().mockReturnValue(mockDb);
mockDb.first = jest.fn().mockResolvedValue(undefined);
mockDb.insert = jest.fn().mockResolvedValue([]);
mockDb.update = jest.fn().mockResolvedValue([]);

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
import transmittalsRouter from '../api/transmittals';
import { TransmittalsRepository } from '../repositories/TransmittalsRepository';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/transmittals', transmittalsRouter);

const repoProto = TransmittalsRepository.prototype;

describe('GET /api/transmittals', () => {
  it('returns transmittals list', async () => {
    jest.spyOn(repoProto, 'findAllWithAgency').mockResolvedValue([
      { id: '1', title: 'Test Transmittal', status: 'draft' } as any,
    ]);

    const res = await request(app).get('/api/transmittals');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Test Transmittal');
  });
});

describe('GET /api/transmittals/:id', () => {
  it('returns 404 for non-existent transmittal', async () => {
    mockDb.first.mockResolvedValueOnce(undefined);

    const res = await request(app).get('/api/transmittals/missing-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Transmittal not found');
  });

  it('returns transmittal with items if found', async () => {
    mockDb.first.mockResolvedValueOnce({
      id: 'tx-1', title: 'Found', status: 'submitted',
    });
    jest.spyOn(repoProto, 'getItems').mockResolvedValue([
      { id: 'item-1', record_id: 'rec-1' } as any,
    ]);

    const res = await request(app).get('/api/transmittals/tx-1');

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Found');
    expect(res.body.data.items).toHaveLength(1);
  });
});

describe('POST /api/transmittals', () => {
  it('rejects invalid body (missing title)', async () => {
    const res = await request(app)
      .post('/api/transmittals')
      .send({ description: 'no title' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('creates transmittal with valid body', async () => {
    jest.spyOn(repoProto, 'create').mockResolvedValue({
      id: 'new-tx', title: 'New Transmittal', status: 'draft',
    } as any);

    const res = await request(app)
      .post('/api/transmittals')
      .send({ title: 'New Transmittal' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New Transmittal');
  });
});

describe('GET /api/transmittals/pending', () => {
  it('returns pending transmittals', async () => {
    jest.spyOn(repoProto, 'findPendingApproval').mockResolvedValue([
      { id: 'p1', title: 'Pending', status: 'submitted' } as any,
    ]);

    const res = await request(app).get('/api/transmittals/pending');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});