import { Router, Request, Response } from 'express';
import { config } from '../config';
import { db } from '../config/database';

const router = Router();

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    if (config.stage !== 'development') {
      return res.status(501).json({ error: 'Use Cognito hosted UI for authentication' });
    }

    const { email } = req.body;
    const user = await db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.email', email || 'sarah.chen@maine.gov')
      .select('users.*', db.raw("array_agg(roles.name) as roles"))
      .groupBy('users.id')
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
    const mappedRoles = user.roles.filter(Boolean).map((r: string) => roleMap[r] || r);

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
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'user_roles.role_id', 'roles.id')
      .where('users.id', userId)
      .select('users.*', db.raw("array_agg(roles.name) as roles"))
      .groupBy('users.id')
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
    const mappedRoles = user.roles.filter(Boolean).map((r: string) => roleMap[r] || r);

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