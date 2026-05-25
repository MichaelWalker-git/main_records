import express from 'express';
import request from 'supertest';

const mockInsert = jest.fn().mockResolvedValue(undefined);
jest.mock('../config/database', () => ({
  db: jest.fn(() => ({
    insert: mockInsert,
  })),
}));

import { auditMiddleware } from '../middleware/audit';

describe('auditMiddleware', () => {
  function createApp() {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.user = {
        id: 'user-1',
        email: 'test@maine.gov',
        roles: ['SYSTEM_ADMIN'],
        agencyId: 'agency-1',
        agencyScope: [],
      };
      next();
    });
    app.use(auditMiddleware);
    app.get('/api/records', (req, res) => res.json({ ok: true }));
    app.post('/api/records', (req, res) => res.status(201).json({ id: 'new-id' }));
    app.delete('/api/records/:id', (req, res) => res.json({ message: 'deleted' }));
    return app;
  }

  beforeEach(() => {
    mockInsert.mockClear();
  });

  it('does not log GET requests', async () => {
    const app = createApp();
    await request(app).get('/api/records');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('logs POST requests', async () => {
    const app = createApp();
    await request(app).post('/api/records').send({ title: 'test' });
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        user_email: 'test@maine.gov',
        action: expect.stringContaining('POST'),
      })
    );
  });

  it('logs DELETE requests', async () => {
    const app = createApp();
    await request(app).delete('/api/records/rec-123');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.stringContaining('DELETE'),
      })
    );
  });
});