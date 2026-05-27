import express from 'express';
import request from 'supertest';

jest.mock('../config', () => ({
  config: {
    stage: 'development',
    cognito: { userPoolId: 'local-dev', clientId: 'test-client', region: 'us-east-1' },
  },
}));

const mockDb: any = jest.fn(() => mockDb);
mockDb.where = jest.fn().mockReturnValue(mockDb);
mockDb.first = jest.fn();

jest.mock('../config/database', () => ({ db: mockDb }));

import authRouter from '../api/auth';

const app = express();
app.use(express.json());
app.use(authRouter);

describe('POST /auth/login (dev mode)', () => {
  beforeEach(() => {
    mockDb.first.mockReset();
  });

  it('returns 400 when email or password missing', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'sarah.chen@maine.gov' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Email and password');
  });

  it('returns 401 when password is wrong', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'sarah.chen@maine.gov', password: '1' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when user not found even with correct password', async () => {
    mockDb.first.mockResolvedValue(undefined);
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'unknown@maine.gov', password: 'Demo@2024!' });
    expect(res.status).toBe(401);
  });

  it('returns user and token with correct email + password', async () => {
    mockDb.first.mockResolvedValue({
      id: 'user-1',
      email: 'sarah.chen@maine.gov',
      first_name: 'Sarah',
      last_name: 'Chen',
      roles: '{SYSTEM_ADMIN}',
      agency_id: 'agency-1',
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'sarah.chen@maine.gov', password: 'Demo@2024!' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('sarah.chen@maine.gov');
    expect(res.body.user.roles).toContain('admin');
    expect(res.body.accessToken).toMatch(/^dev-token-/);
  });
});
