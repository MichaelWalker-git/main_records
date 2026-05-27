import { Router, Request, Response } from 'express';
import { config } from '../config';
import { db } from '../config/database';

const router = Router();

function parseRoles(roles: any): string[] {
  if (Array.isArray(roles)) return roles.filter(Boolean);
  if (typeof roles === 'string') {
    // PostgreSQL text[] literal: "{SYSTEM_ADMIN,ARCHIVES_STAFF}"
    return roles.replace(/^\{|\}$/g, '').split(',').filter(Boolean);
  }
  return [];
}

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo@2024!';

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    if (config.stage !== 'development') {
      return res.status(501).json({ error: 'Use Cognito hosted UI for authentication' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password !== DEMO_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = await db('users')
      .where('email', email)
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const roleMap: Record<string, string> = {
      SYSTEM_ADMIN: 'admin',
      ARCHIVES_STAFF: 'staff',
      RECORDS_OFFICER: 'records_officer',
      AGENCY_STAFF: 'agency_user',
    };
    const roles = parseRoles(user.roles);
    const mappedRoles = roles.map((r: string) => roleMap[r] || r);

    res.json({
      accessToken: 'dev-token-' + user.id,
      refreshToken: 'dev-refresh-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: mappedRoles,
        agencyId: user.agency_id,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/auth/me', async (req: Request, res: Response) => {
  try {
    if (config.stage !== 'development') {
      return res.status(501).json({ error: 'Use Cognito for user info' });
    }

    // In dev mode, extract user from the mock token or default to admin
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const userId = token.replace('dev-token-', '') || 'b2c3d4e5-2222-4000-8000-000000000001';

    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const roleMap: Record<string, string> = {
      SYSTEM_ADMIN: 'admin',
      ARCHIVES_STAFF: 'staff',
      RECORDS_OFFICER: 'records_officer',
      AGENCY_STAFF: 'agency_user',
    };
    const roles = parseRoles(user.roles);
    const mappedRoles = roles.map((r: string) => roleMap[r] || r);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: mappedRoles,
      agencyId: user.agency_id,
    });
  } catch (err) {
    console.error('Auth/me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

router.post('/auth/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  res.json({ accessToken: refreshToken?.replace('refresh', 'token') || 'dev-token' });
});

export default router;