import express from 'express';
import request from 'supertest';

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
    bedrock: { modelId: '', embeddingModelId: '', region: 'us-east-1' },
    databaseUrl: 'postgresql://localhost:5432/test',
    port: 3000,
    kmsKeyArn: '',
  },
}));

jest.mock('../services/ReportService', () => ({
  ReportService: jest.fn().mockImplementation(() => ({
    getDashboardMetrics: jest.fn().mockResolvedValue({
      totalRecords: 150,
      activeRecords: 120,
      pendingTransmittals: 5,
      pendingDispositions: 3,
      overdueCheckouts: 2,
      recentActivity: [],
      recordsByType: [],
    }),
    getRetentionReport: jest.fn().mockResolvedValue([
      { name: 'General', code: 'GEN-01', count: 45 },
    ]),
    getActivityReport: jest.fn().mockResolvedValue([
      { date: '2026-05-20', count: 12 },
    ]),
    generateReport: jest.fn().mockImplementation((reportId: string, format: string) => {
      if (format === 'csv' || format === 'excel') {
        return Promise.resolve({
          content: 'col1,col2\nval1,val2',
          contentType: 'text/csv',
          filename: `${reportId}-2026-05-26.csv`,
        });
      }
      return Promise.resolve({
        content: '<html><body>report</body></html>',
        contentType: 'text/html',
        filename: `${reportId}-2026-05-26.html`,
      });
    }),
  })),
}));

import { authMiddleware } from '../middleware/auth';
import analyticsRouter from '../api/analytics';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/analytics', analyticsRouter);

describe('GET /api/analytics/dashboard', () => {
  it('returns dashboard metrics', async () => {
    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalRecords', 150);
    expect(res.body.data).toHaveProperty('activeRecords', 120);
    expect(res.body.data).toHaveProperty('pendingTransmittals', 5);
  });
});

describe('GET /api/analytics/reports/retention', () => {
  it('returns retention report data', async () => {
    const res = await request(app).get('/api/analytics/reports/retention');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('General');
  });
});

describe('GET /api/analytics/reports/activity', () => {
  it('returns activity report', async () => {
    const res = await request(app).get('/api/analytics/reports/activity');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('accepts days query parameter', async () => {
    const res = await request(app).get('/api/analytics/reports/activity?days=7');

    expect(res.status).toBe(200);
  });
});

describe('GET /api/analytics/export/:reportType', () => {
  it('returns JSON export with content-disposition header', async () => {
    const res = await request(app).get('/api/analytics/export/retention');

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('retention-report.json');
  });
});

describe('POST /api/analytics/reports/generate', () => {
  it('generates CSV report', async () => {
    const res = await request(app)
      .post('/api/analytics/reports/generate')
      .send({ reportId: 'retention-compliance', format: 'csv' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('col1');
  });

  it('generates HTML report for pdf format', async () => {
    const res = await request(app)
      .post('/api/analytics/reports/generate')
      .send({ reportId: 'retention-compliance', format: 'pdf' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
  });
});