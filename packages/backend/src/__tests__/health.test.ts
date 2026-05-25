import express from 'express';
import request from 'supertest';

// Mock the database module before importing the router
jest.mock('../config/database', () => ({
  db: {
    raw: jest.fn(),
  },
}));

import healthRouter from '../api/health';
import { db } from '../config/database';

const app = express();
app.use('', healthRouter);

describe('GET /health', () => {
  it('returns healthy when database is available', async () => {
    (db.raw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.version).toBeDefined();
  });

  it('returns degraded when database is unavailable', async () => {
    (db.raw as jest.Mock).mockRejectedValue(new Error('Connection refused'));

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database).toBe('unavailable');
  });
});