import express from 'express';
import request from 'supertest';

const mockDb: any = jest.fn(() => mockDb);
mockDb.raw = jest.fn().mockResolvedValue({ rows: [] });
mockDb.where = jest.fn().mockReturnValue(mockDb);
mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
mockDb.limit = jest.fn().mockResolvedValue([]);
mockDb.select = jest.fn().mockReturnValue(mockDb);
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
import templatesRouter from '../api/templates';
import { TemplatesRepository } from '../repositories/TemplatesRepository';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/templates', templatesRouter);

const repoProto = TemplatesRepository.prototype;

describe('GET /api/templates', () => {
  it('returns active templates', async () => {
    jest.spyOn(repoProto, 'findActive').mockResolvedValue([
      { id: '1', name: 'Box Template', is_active: true, field_definitions: '[]' } as any,
    ]);

    const res = await request(app).get('/api/templates');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Box Template');
  });
});

describe('POST /api/templates', () => {
  it('creates template', async () => {
    jest.spyOn(repoProto, 'create').mockResolvedValue({
      id: 'new-t', name: 'New Template', is_active: true,
    } as any);

    const res = await request(app)
      .post('/api/templates')
      .send({ name: 'New Template', fields: [{ label: 'Field 1', type: 'text' }] });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Template');
  });
});

describe('PUT /api/templates/:id', () => {
  it('returns 404 for non-existent template', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app)
      .put('/api/templates/missing')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Template not found');
  });

  it('updates template', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 't1', name: 'Old' } as any);
    jest.spyOn(repoProto, 'update').mockResolvedValue({ id: 't1', name: 'Updated' } as any);

    const res = await request(app)
      .put('/api/templates/t1')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });
});

describe('DELETE /api/templates/:id', () => {
  it('returns 404 for non-existent template', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).delete('/api/templates/missing');

    expect(res.status).toBe(404);
  });

  it('soft-deletes (deactivates) template', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 't1', is_active: true } as any);
    jest.spyOn(repoProto, 'update').mockResolvedValue({ id: 't1', is_active: false } as any);

    const res = await request(app).delete('/api/templates/t1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Template deactivated');
  });
});