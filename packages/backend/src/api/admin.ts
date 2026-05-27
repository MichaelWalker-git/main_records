import { Router, Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/authorize';
import { RetentionSchedulesRepository } from '../repositories/RetentionSchedulesRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const retentionRepo = new RetentionSchedulesRepository(db);
const auditRepo = new AuditRepository(db);

// --- Retention Schedules ---

router.get('/retention-schedules', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schedules = await retentionRepo.findActive();
    res.json({ data: schedules });
  } catch (err) { next(err); }
});

router.post('/retention-schedules', authorize('admin:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, title, description, retention_years, disposition_action, disposition_method, alert_days_before } = req.body;
    const schedule = await retentionRepo.create({
      id: uuidv4(),
      code,
      name: name || title || code,
      description: description || '',
      retention_years: parseInt(retention_years) || 7,
      disposition_action: disposition_action || disposition_method || 'DESTROY',
      is_active: true,
      alert_days_before: parseInt(alert_days_before) || 90,
    } as any);
    res.status(201).json({ data: schedule });
  } catch (err) { next(err); }
});

router.put('/retention-schedules/:id', authorize('admin:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await retentionRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Schedule not found' });
    const updated = await retentionRepo.update(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) { next(err); }
});

// --- Audit Log ---

router.get('/audit-log', authorize('admin:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 50, search, action } = req.query as any;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = Math.min(parseInt(pageSize) || 50, 200);

    const filters: any = {};
    if (action) filters.action = action;
    if (!req.user!.roles.includes('SYSTEM_ADMIN')) {
      filters.agency_id = req.user!.agencyId;
    }

    const events = await auditRepo.query(filters, limit, offset);
    const total = await auditRepo.countByFilters(filters);

    res.json({ data: events, total, page: parseInt(page), pageSize: limit });
  } catch (err) { next(err); }
});

export default router;