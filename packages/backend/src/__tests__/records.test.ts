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
mockDb.raw = jest.fn().mockReturnValue(mockDb);
mockDb.where = jest.fn().mockReturnValue(mockDb);
mockDb.whereIn = jest.fn().mockReturnValue(mockDb);
mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
mockDb.limit = jest.fn().mockReturnValue(mockDb);
mockDb.offset = jest.fn().mockResolvedValue([]);
mockDb.select = jest.fn().mockReturnValue(mockDb);
mockDb.leftJoin = jest.fn().mockReturnValue(mockDb);
mockDb.first = jest.fn().mockResolvedValue(undefined);
mockDb.insert = jest.fn().mockResolvedValue([]);
mockDb.update = jest.fn().mockResolvedValue([]);
mockDb.del = jest.fn().mockResolvedValue(1);
mockDb.delete = jest.fn().mockResolvedValue(1);
mockDb.clone = jest.fn().mockReturnValue(mockDb);
mockDb.clearSelect = jest.fn().mockReturnValue(mockDb);
mockDb.clearOrder = jest.fn().mockReturnValue(mockDb);
mockDb.count = jest.fn().mockResolvedValue([{ count: 0 }]);
mockDb.then = undefined; // prevent Promise resolution of chainable

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
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID2 = '550e8400-e29b-41d4-a716-446655440001';

describe('GET /api/records', () => {
  it('returns 200 with data array', async () => {
    mockDb.offset.mockResolvedValueOnce([
      { id: '1', title: 'Test Record', record_type: 'general' },
    ]);
    mockDb.count.mockResolvedValueOnce([{ count: 1 }]);

    const res = await request(app).get('/api/records');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
  });
});

describe('GET /api/records/status-transitions', () => {
  it('returns the valid transition map', async () => {
    const res = await request(app).get('/api/records/status-transitions');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    // active should be able to transition to several statuses including in_transit and on_hold
    expect(res.body.data.active).toEqual(expect.arrayContaining(['checked_out', 'in_transit', 'on_hold']));
    // in_transit can resolve to active or checked_out (the bug case)
    expect(res.body.data.in_transit).toEqual(expect.arrayContaining(['active', 'checked_out']));
    // terminal states have no outgoing transitions
    expect(res.body.data.disposed).toEqual([]);
    expect(res.body.data.destroyed).toEqual([]);
  });
});

describe('GET /api/records/:id', () => {
  it('returns 404 for non-existent record', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).get(`/api/records/${VALID_UUID}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Record not found');
  });

  it('returns record if found', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({
      id: VALID_UUID,
      title: 'Found Record',
      agency_id: '',
    } as any);

    const res = await request(app).get(`/api/records/${VALID_UUID}`);

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

describe('POST /api/records/:id/upload', () => {
  it('returns 400 if filename or contentType missing', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);

    const res = await request(app)
      .post(`/api/records/${VALID_UUID}/upload`)
      .send({ filename: 'test.pdf' }); // missing contentType

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('contentType');
  });

  it('returns presigned upload URL', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);

    const res = await request(app)
      .post(`/api/records/${VALID_UUID}/upload`)
      .send({ filename: 'invoice.pdf', contentType: 'application/pdf' });

    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBe('https://presigned-url.example.com');
    expect(res.body.s3Key).toContain('documents/');
  });
});

describe('POST /api/records/:id/upload/confirm', () => {
  it('returns 400 if s3Key missing', async () => {
    const res = await request(app)
      .post(`/api/records/${VALID_UUID}/upload/confirm`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('s3Key');
  });

  it('confirms upload and triggers OCR', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);
    jest.spyOn(repoProto, 'update').mockResolvedValue(undefined as any);

    const res = await request(app)
      .post(`/api/records/${VALID_UUID}/upload/confirm`)
      .send({ s3Key: `documents/ag1/${VALID_UUID}/file.pdf` });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ocr_initiated');
  });
});

describe('GET /api/records/:id/download', () => {
  it('returns 404 if record not found', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).get(`/api/records/${VALID_UUID}/download`);

    expect(res.status).toBe(404);
  });

  it('returns 404 if no document attached', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({
      id: VALID_UUID, agency_id: 'ag1', document_key: null,
    } as any);

    const res = await request(app).get(`/api/records/${VALID_UUID}/download`);

    expect(res.status).toBe(404);
  });

  it('returns presigned download URL', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({
      id: VALID_UUID, agency_id: 'ag1', document_key: `documents/ag1/${VALID_UUID}/invoice.pdf`,
    } as any);

    const res = await request(app).get(`/api/records/${VALID_UUID}/download`);

    expect(res.status).toBe(200);
    expect(res.body.downloadUrl).toBe('https://presigned-url.example.com');
    expect(res.body.filename).toBe('invoice.pdf');
  });
});

describe('PUT /api/records/:id - digitalmaine.com classification metadata', () => {
  it('accepts and persists all 8 digitalmaine fields', async () => {
    const updated = {
      id: VALID_UUID,
      title: 'WWI Letter',
      agency_id: 'ag1',
      contributing_institution: 'Maine State Archives',
      document_type_dm: 'Text',
      dm_identifier: '15-28455-F026-I016',
      exact_creation_date: '1917-09-15',
      doc_language: 'English',
      doc_location: 'Portland, ME',
      keywords: ['Maine', 'World War I', 'National Guard'],
      recommended_citation: 'Grant, Giles C., "Letter to a Doctor..." (1917).',
    };
    jest.spyOn(repoProto, 'findById').mockResolvedValue(updated as any);
    const updateSpy = jest.spyOn(repoProto, 'update').mockResolvedValue(updated as any);

    // The frontend axios interceptor transforms camelCase -> snake_case before
    // hitting the API, so the backend zod schema accepts snake_case keys.
    const res = await request(app)
      .put(`/api/records/${VALID_UUID}`)
      .send({
        title: 'WWI Letter',
        contributing_institution: 'Maine State Archives',
        document_type_dm: 'Text',
        dm_identifier: '15-28455-F026-I016',
        exact_creation_date: '1917-09-15',
        doc_language: 'English',
        doc_location: 'Portland, ME',
        keywords: ['Maine', 'World War I', 'National Guard'],
        recommended_citation: 'Grant, Giles C., "Letter to a Doctor..." (1917).',
      });

    expect(res.status).toBe(200);
    expect(updateSpy).toHaveBeenCalled();
    const updatePayload = updateSpy.mock.calls[0][1] as any;
    expect(updatePayload.contributing_institution).toBe('Maine State Archives');
    expect(updatePayload.document_type_dm).toBe('Text');
    expect(updatePayload.dm_identifier).toBe('15-28455-F026-I016');
    expect(updatePayload.exact_creation_date).toBe('1917-09-15');
    expect(updatePayload.doc_language).toBe('English');
    expect(updatePayload.doc_location).toBe('Portland, ME');
    expect(updatePayload.keywords).toEqual(['Maine', 'World War I', 'National Guard']);
    expect(updatePayload.recommended_citation).toContain('Grant');
  });

  it('rejects an invalid documentTypeDm value', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);

    const res = await request(app)
      .put(`/api/records/${VALID_UUID}`)
      .send({ document_type_dm: 'NotAllowed' });

    expect(res.status).toBe(400);
  });

  it('rejects keywords that exceed the 50-item limit', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);
    const tooMany = Array.from({ length: 51 }, (_, i) => `kw-${i}`);

    const res = await request(app)
      .put(`/api/records/${VALID_UUID}`)
      .send({ keywords: tooMany });

    expect(res.status).toBe(400);
  });

  it('rejects camelCase keys with a structured details payload (so the UI can localise)', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: 'ag1' } as any);

    // Frontend axios interceptor normally rewrites camelCase -> snake_case.
    // If a regression bypasses that pipeline (e.g. raw fetch from a tool),
    // the .strict() schema must fail loudly with the offending key listed.
    const res = await request(app)
      .put(`/api/records/${VALID_UUID}`)
      .send({ contributingInstitution: 'Maine State Archives' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(Array.isArray(res.body.details)).toBe(true);
    const messages = res.body.details.map((d: any) => d.message).join(' ');
    expect(messages).toMatch(/contributingInstitution/);
  });

  it('accepts every digitalmaine field together (full happy-path round trip)', async () => {
    const recordId = VALID_UUID2;
    const updated = {
      id: recordId,
      title: 'WWI Memo',
      agency_id: 'ag1',
    };
    jest.spyOn(repoProto, 'findById').mockResolvedValue(updated as any);
    const updateSpy = jest.spyOn(repoProto, 'update').mockResolvedValue(updated as any);

    const res = await request(app)
      .put(`/api/records/${recordId}`)
      .send({
        title: 'WWI Memo',
        contributing_institution: 'Maine State Archives',
        document_type_dm: 'Map',
        dm_identifier: '15-28455-F026-I999',
        exact_creation_date: '1918-11-11',
        doc_language: 'English',
        doc_location: 'Augusta, ME',
        keywords: [],
        recommended_citation: 'War Department (1918). "Memo."',
      });

    expect(res.status).toBe(200);
    const payload = updateSpy.mock.calls[0][1] as any;
    expect(payload.keywords).toEqual([]);
    expect(payload.document_type_dm).toBe('Map');
    expect(payload.exact_creation_date).toBe('1918-11-11');
  });
});

describe('DELETE /api/records/:id', () => {
  it('returns 404 for non-existent record', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).delete(`/api/records/${VALID_UUID}`);

    expect(res.status).toBe(404);
  });

  it('deletes record successfully', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: VALID_UUID, agency_id: '' } as any);
    jest.spyOn(repoProto, 'delete').mockResolvedValue(undefined as any);
    // Mock dispositions cleanup
    const { DispositionsRepository } = require('../repositories/DispositionsRepository');
    jest.spyOn(DispositionsRepository.prototype, 'removeRecordFromDispositions').mockResolvedValue(undefined);

    const res = await request(app).delete(`/api/records/${VALID_UUID}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Record deleted');
  });
});