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
import dispositionsRouter from '../api/dispositions';
import { DispositionsRepository } from '../repositories/DispositionsRepository';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/dispositions', dispositionsRouter);

const repoProto = DispositionsRepository.prototype;

describe('GET /api/dispositions', () => {
  it('returns dispositions list with pagination metadata', async () => {
    jest.spyOn(repoProto, 'findAllWithAgency').mockResolvedValue([
      { id: '1', title: 'Disposition 1', status: 'PENDING_APPROVAL' } as any,
    ]);

    const res = await request(app).get('/api/dispositions');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(25);
    expect(res.body.totalPages).toBe(1);
  });

  it('paginates correctly when more items than pageSize', async () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ id: `d-${i}`, title: `D${i}`, status: 'pending' } as any));
    jest.spyOn(repoProto, 'findAllWithAgency').mockResolvedValue(items);

    const res = await request(app).get('/api/dispositions?page=2&pageSize=5');

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(12);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[0].id).toBe('d-5');
  });

  it('returns empty data on out-of-range page', async () => {
    jest.spyOn(repoProto, 'findAllWithAgency').mockResolvedValue([
      { id: '1', title: 'Only', status: 'pending' } as any,
    ]);
    const res = await request(app).get('/api/dispositions?page=99');
    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(1);
    expect(res.body.totalPages).toBe(1);
  });

  it('applies status filter before paginating', async () => {
    jest.spyOn(repoProto, 'findAllWithAgency').mockResolvedValue([
      { id: '1', status: 'pending' } as any,
      { id: '2', status: 'approved' } as any,
      { id: '3', status: 'pending_approval' } as any,
    ]);
    const res = await request(app).get('/api/dispositions?status=pending');
    expect(res.body.total).toBe(2);
    expect(res.body.data.map((d: any) => d.id)).toEqual(['1', '3']);
  });
});

describe('GET /api/dispositions/:id', () => {
  it('returns 404 for non-existent disposition', async () => {
    mockDb.first.mockResolvedValueOnce(undefined);

    const res = await request(app).get('/api/dispositions/missing');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Disposition not found');
  });

  it('returns disposition with items', async () => {
    mockDb.first.mockResolvedValueOnce({
      id: 'd1', title: 'Destroy Records', status: 'PENDING_APPROVAL',
    });
    jest.spyOn(repoProto, 'getItems').mockResolvedValue([
      { id: 'di-1', record_id: 'rec-1' } as any,
    ]);

    const res = await request(app).get('/api/dispositions/d1');

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Destroy Records');
    expect(res.body.data.items).toHaveLength(1);
  });
});

describe('POST /api/dispositions', () => {
  it('rejects invalid body (missing required fields)', async () => {
    const res = await request(app)
      .post('/api/dispositions')
      .send({ title: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects invalid disposition_action', async () => {
    const res = await request(app)
      .post('/api/dispositions')
      .send({
        title: 'Test',
        disposition_action: 'invalid_action',
        record_ids: ['550e8400-e29b-41d4-a716-446655440000'],
      });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/dispositions/legal-holds', () => {
  it('rejects invalid body (missing reason)', async () => {
    const res = await request(app)
      .post('/api/dispositions/legal-holds')
      .send({ record_id: '550e8400-e29b-41d4-a716-446655440000' });

    expect(res.status).toBe(400);
  });

  it('creates legal hold', async () => {
    jest.spyOn(repoProto, 'createLegalHold').mockResolvedValue({
      id: 'lh-1', record_id: 'rec-1', reason: 'Pending litigation', is_active: true,
    } as any);

    const res = await request(app)
      .post('/api/dispositions/legal-holds')
      .send({ record_id: '550e8400-e29b-41d4-a716-446655440000', reason: 'Pending litigation' });

    expect(res.status).toBe(201);
    expect(res.body.data.reason).toBe('Pending litigation');
  });
});