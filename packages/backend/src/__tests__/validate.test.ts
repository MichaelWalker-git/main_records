import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const schema = z.object({
  title: z.string().min(1).max(100),
  count: z.number().int().positive().optional(),
});

const app = express();
app.use(express.json());
app.post('/test', validate(schema), (req, res) => {
  res.json({ data: req.body });
});

describe('validate middleware', () => {
  it('passes valid body through', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Test Record', count: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Test Record');
  });

  it('rejects missing required field', async () => {
    const res = await request(app)
      .post('/test')
      .send({ count: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toHaveLength(1);
    expect(res.body.details[0].path).toBe('title');
  });

  it('rejects invalid type', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Ok', count: -1 });

    expect(res.status).toBe(400);
    expect(res.body.details[0].path).toBe('count');
  });

  it('strips unknown fields', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: 'Test', extra: 'ignored' });

    expect(res.status).toBe(200);
    expect(res.body.data.extra).toBeUndefined();
  });

  it('rejects empty title', async () => {
    const res = await request(app)
      .post('/test')
      .send({ title: '' });

    expect(res.status).toBe(400);
  });
});