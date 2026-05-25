import express from 'express';
import request from 'supertest';

// We test the auth middleware in development bypass mode
// and token rejection mode (without needing real JWKS)

jest.mock('../config', () => ({
  config: {
    stage: 'development',
    cognito: {
      userPoolId: 'local-dev',
      clientId: 'test-client',
      region: 'us-east-1',
    },
  },
}));

import { authMiddleware } from '../middleware/auth';

describe('authMiddleware - development bypass', () => {
  const app = express();
  app.use(authMiddleware);
  app.get('/test', (req, res) => {
    res.json({ user: req.user });
  });

  it('injects mock admin user in development mode', async () => {
    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('sarah.chen@maine.gov');
    expect(res.body.user.roles).toContain('SYSTEM_ADMIN');
  });
});

describe('authMiddleware - production mode (token required)', () => {
  let app: express.Express;

  beforeAll(() => {
    jest.resetModules();
    jest.mock('../config', () => ({
      config: {
        stage: 'production',
        cognito: {
          userPoolId: 'us-east-1_abc123',
          clientId: 'client-id',
          region: 'us-east-1',
        },
      },
    }));
  });

  beforeEach(async () => {
    const { authMiddleware: prodAuth } = await import('../middleware/auth');
    app = express();
    app.use(prodAuth);
    app.get('/test', (req, res) => res.json({ user: req.user }));
  });

  it('returns 401 if no Authorization header', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Missing');
  });

  it('returns 401 if Authorization header is not Bearer', async () => {
    const res = await request(app)
      .get('/test')
      .set('Authorization', 'Basic abc123');
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid JWT token', async () => {
    const res = await request(app)
      .get('/test')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid');
  });
});