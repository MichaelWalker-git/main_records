import { Request, Response, NextFunction } from 'express';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SYSTEM_ADMIN: ['*'],
  ARCHIVES_STAFF: [
    'records:read', 'records:write', 'records:delete',
    'transmittals:read', 'transmittals:write', 'transmittals:approve',
    'dispositions:read', 'dispositions:write', 'dispositions:approve',
    'inventory:read', 'inventory:write',
    'search:read', 'analytics:read',
    'users:read',
  ],
  RECORDS_OFFICER: [
    'records:read', 'records:write',
    'transmittals:read', 'transmittals:write',
    'dispositions:read', 'dispositions:write',
    'inventory:read', 'inventory:write',
    'search:read', 'analytics:read',
  ],
  AGENCY_STAFF: [
    'records:read', 'records:write',
    'transmittals:read', 'transmittals:write',
    'inventory:read',
    'search:read',
  ],
  VIEWER: ['records:read', 'search:read', 'analytics:read'],
};

export function authorize(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasPermission = req.user.roles.some((role) => {
      const perms = ROLE_PERMISSIONS[role];
      if (!perms) return false;
      return perms.includes('*') || perms.includes(permission);
    });

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
