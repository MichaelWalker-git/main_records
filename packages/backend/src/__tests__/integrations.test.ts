import express from 'express';
import request from 'supertest';

jest.mock('../config', () => ({
  config: {
    stage: 'development',
    cognito: { userPoolId: 'local-dev', clientId: 'test-client', region: 'us-east-1' },
    s3: { documentsBucket: 'maine-rms-docs', exportsBucket: 'maine-rms-exports' },
    sqs: { classifyQueueUrl: 'https://sqs.example.com/classify', ocrQueueUrl: '', notificationQueueUrl: 'https://sqs.example.com/notify' },
    bedrock: { modelId: 'anthropic.claude-3-5-sonnet', embeddingModelId: '', region: 'us-east-1' },
    databaseUrl: 'postgresql://localhost:5432/test',
    port: 3000,
    kmsKeyArn: '',
  },
}));

const mockDb: any = jest.fn(() => mockDb);
jest.mock('../config/database', () => ({ db: mockDb }));

import { authMiddleware } from '../middleware/auth';
import integrationsRouter from '../api/integrations';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/integrations', integrationsRouter);

describe('GET /api/integrations', () => {
  it('returns list of integrations', async () => {
    const res = await request(app).get('/api/integrations');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0]).toHaveProperty('status');
    expect(res.body.data[0]).toHaveProperty('health');
  });

  it('shows connected status when config is present', async () => {
    const res = await request(app).get('/api/integrations');

    const ad = res.body.data.find((i: any) => i.id === 'active-directory');
    expect(ad.status).toBe('connected');

    const s3 = res.body.data.find((i: any) => i.id === 'document-storage');
    expect(s3.status).toBe('connected');
  });
});

describe('GET /api/integrations/:id/status', () => {
  it('returns 404 for unknown integration', async () => {
    const res = await request(app).get('/api/integrations/nonexistent/status');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Integration not found');
  });

  it('returns specific integration status', async () => {
    const res = await request(app).get('/api/integrations/document-ocr/status');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('document-ocr');
    expect(res.body.data.status).toBe('connected');
  });
});

describe('GET /api/integrations/:id/history', () => {
  it('returns sync history', async () => {
    const res = await request(app).get('/api/integrations/active-directory/history');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[0]).toHaveProperty('timestamp');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it('returns 404 for unknown integration', async () => {
    const res = await request(app).get('/api/integrations/unknown/history');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/integrations/:id/test', () => {
  it('tests AD connection using cognito config', async () => {
    const res = await request(app).post('/api/integrations/active-directory/test');

    expect(res.status).toBe(200);
    expect(res.body.data.testResult).toBe('success');
    expect(res.body.data.message).toContain('Cognito pool');
  });

  it('tests S3 connection', async () => {
    const res = await request(app).post('/api/integrations/document-storage/test');

    expect(res.status).toBe(200);
    expect(res.body.data.testResult).toBe('success');
    expect(res.body.data.message).toContain('maine-rms-docs');
  });

  it('returns pending for ArchivesSpace', async () => {
    const res = await request(app).post('/api/integrations/archivesspace/test');

    expect(res.status).toBe(200);
    expect(res.body.data.testResult).toBe('pending');
  });

  it('returns 404 for unknown integration', async () => {
    const res = await request(app).post('/api/integrations/unknown/test');

    expect(res.status).toBe(404);
  });
});