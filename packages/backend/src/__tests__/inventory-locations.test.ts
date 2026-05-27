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
mockDb.first = jest.fn().mockResolvedValue(undefined);
mockDb.insert = jest.fn().mockResolvedValue([]);
mockDb.update = jest.fn().mockResolvedValue([]);
mockDb.count = jest.fn().mockReturnValue(mockDb);

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
import inventoryRouter from '../api/inventory';
import { LocationsRepository } from '../repositories/LocationsRepository';
import { InventoryService } from '../services/InventoryService';

const app = express();
app.use(express.json());
app.use(authMiddleware);
app.use('/api/inventory', inventoryRouter);

const repoProto = LocationsRepository.prototype;
const svcProto = InventoryService.prototype;

describe('POST /api/inventory/locations', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockDb.first.mockReset();
  });

  it('creates a top-level location', async () => {
    jest.spyOn(svcProto, 'createLocation').mockResolvedValue({
      id: 'loc-1', name: 'Augusta Warehouse', code: 'SRC-AUG', location_type: 'building', capacity: 10000,
    } as any);

    const res = await request(app).post('/api/inventory/locations').send({
      name: 'Augusta Warehouse',
      code: 'SRC-AUG',
      location_type: 'building',
      capacity: 10000,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('SRC-AUG');
  });

  it('rejects when parent_id does not exist', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);

    const res = await request(app).post('/api/inventory/locations').send({
      name: 'Floor 1',
      code: 'F1',
      location_type: 'floor',
      capacity: 1000,
      parent_id: '00000000-0000-4000-8000-000000000001',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Parent');
  });

  it('rejects invalid capacity', async () => {
    const res = await request(app).post('/api/inventory/locations').send({
      name: 'X',
      code: 'X',
      location_type: 'building',
      capacity: -5,
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/inventory/locations/:id', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('updates an existing location', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 'loc-1', parent_id: null } as any);
    jest.spyOn(repoProto, 'update').mockResolvedValue({ id: 'loc-1', capacity: 5000 } as any);

    const res = await request(app).put('/api/inventory/locations/loc-1').send({ capacity: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.data.capacity).toBe(5000);
  });

  it('returns 404 when location not found', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);
    const res = await request(app).put('/api/inventory/locations/missing').send({ capacity: 100 });
    expect(res.status).toBe(404);
  });

  it('rejects self-parenting', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: '00000000-0000-4000-8000-000000000001', parent_id: null } as any);
    const res = await request(app)
      .put('/api/inventory/locations/00000000-0000-4000-8000-000000000001')
      .send({ parent_id: '00000000-0000-4000-8000-000000000001' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('its own parent');
  });
});

describe('DELETE /api/inventory/locations/:id', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('deactivates a leaf location', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 'loc-1', is_active: true } as any);
    mockDb.first.mockResolvedValueOnce({ count: '0' });
    jest.spyOn(repoProto, 'update').mockResolvedValue({ id: 'loc-1', is_active: false } as any);

    const res = await request(app).delete('/api/inventory/locations/loc-1');
    expect(res.status).toBe(204);
  });

  it('refuses to deactivate when active children exist', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue({ id: 'loc-1', is_active: true } as any);
    mockDb.first.mockResolvedValueOnce({ count: '3' });

    const res = await request(app).delete('/api/inventory/locations/loc-1');
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('child');
  });

  it('returns 404 for missing location', async () => {
    jest.spyOn(repoProto, 'findById').mockResolvedValue(null as any);
    const res = await request(app).delete('/api/inventory/locations/missing');
    expect(res.status).toBe(404);
  });
});
