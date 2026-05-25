import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATION_METHODS.includes(req.method)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    if (req.user && res.statusCode < 400) {
      db('audit_events')
        .insert({
          user_id: req.user.id,
          user_email: req.user.email,
          agency_id: req.user.agencyId,
          action: `${req.method} ${req.originalUrl}`,
          resource_type: req.originalUrl.split('/')[2] || 'unknown',
          resource_id: req.params.id || body?.id || null,
          metadata: JSON.stringify({
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
          }),
          created_at: new Date(),
        })
        .catch(() => {});
    }
    return originalJson(body);
  };

  next();
}
