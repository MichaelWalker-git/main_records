import express from 'express';
import request from 'supertest';
import { errorHandler, AppError } from '../middleware/errorHandler';

function createApp(thrower: () => never) {
  const app = express();
  app.get('/test', (req, res, next) => {
    try { thrower(); } catch (e) { next(e); }
  });
  app.use(errorHandler);
  return app;
}

describe('errorHandler middleware', () => {
  it('handles AppError with custom status and code', async () => {
    const app = createApp(() => { throw new AppError(409, 'Conflict detected', 'CONFLICT'); });
    const res = await request(app).get('/test');

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Conflict detected');
    expect(res.body.code).toBe('CONFLICT');
  });

  it('handles errors with status property (body-parser)', async () => {
    const app = createApp(() => {
      const err: any = new Error('entity too large');
      err.status = 413;
      throw err;
    });
    const res = await request(app).get('/test');

    expect(res.status).toBe(413);
    expect(res.body.code).toBe('BAD_REQUEST');
  });

  it('returns 500 for unknown errors', async () => {
    const app = createApp(() => { throw new Error('something broke'); });
    const res = await request(app).get('/test');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });
});