import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { TransmittalsRepository } from '../repositories/TransmittalsRepository';
import { DispositionsRepository } from '../repositories/DispositionsRepository';
import { ReferenceRequestsRepository } from '../repositories/ReferenceRequestsRepository';
import { NotificationService } from '../services/NotificationService';
import { WorkflowService } from '../services/WorkflowService';
import { db } from '../config/database';

const router = Router();

const transmittalsRepo = new TransmittalsRepository(db);
const dispositionsRepo = new DispositionsRepository(db);
const referenceRepo = new ReferenceRequestsRepository(db);
const notificationService = new NotificationService(db);
const workflowService = new WorkflowService(transmittalsRepo, dispositionsRepo, referenceRepo, notificationService);

const createDispositionSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  disposition_action: z.enum(['destroy', 'transfer', 'archive']),
  record_ids: z.array(z.string().uuid()).min(1),
});

const createLegalHoldSchema = z.object({
  record_id: z.string().uuid(),
  reason: z.string().min(1),
});

router.get('/', authorize('dispositions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', pageSize = '25', status } = req.query as any;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    let dispositions = isAdmin
      ? await dispositionsRepo.findAllWithAgency()
      : await dispositionsRepo.findByAgency(req.user!.agencyId);
    if (status) {
      dispositions = dispositions.filter((d: any) => d.status === status || (status === 'pending' && (d.status === 'pending' || d.status === 'pending_approval')));
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const sizeNum = Math.max(1, Math.min(100, Number(pageSize) || 25));
    const total = dispositions.length;
    const totalPages = Math.max(1, Math.ceil(total / sizeNum));
    const start = (pageNum - 1) * sizeNum;
    const paged = dispositions.slice(start, start + sizeNum);
    res.json({ data: paged, total, page: pageNum, pageSize: sizeNum, totalPages });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('dispositions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disposition = await db('dispositions')
      .select('dispositions.*', 'agencies.name as agency_name', 'agencies.code as agency_code')
      .leftJoin('agencies', 'dispositions.agency_id', 'agencies.id')
      .where({ 'dispositions.id': req.params.id })
      .first();
    if (!disposition) return res.status(404).json({ error: 'Disposition not found' });
    const items = await dispositionsRepo.getItems(req.params.id);
    res.json({ data: { ...disposition, items } });
  } catch (err) { next(err); }
});

router.post('/', authorize('dispositions:write'), validate(createDispositionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disposition = await workflowService.initiateDisposition(req.body, req.user!.id, req.user!.agencyId);
    res.status(201).json({ data: disposition });
  } catch (err) { next(err); }
});

router.post('/:id/approve', authorize('dispositions:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level = 'first' } = req.body;
    const result = await workflowService.approveDisposition(req.params.id, req.user!.id, level);
    res.json({ data: result });
  } catch (err) { next(err); }
});

router.post('/:id/reject', authorize('dispositions:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await workflowService.rejectDisposition(req.params.id, req.user!.id, reason);
    res.json({ data: result });
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('dispositions:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disposition = await dispositionsRepo.findById(req.params.id);
    if (!disposition) return res.status(404).json({ error: 'Disposition not found' });
    // Delete disposition and its items, get affected record IDs
    const recordIds = await dispositionsRepo.deleteWithItems(req.params.id);
    // Reset records back to active
    if (recordIds.length > 0) {
      await db('records').whereIn('id', recordIds).where('status', 'pending_disposition').update({ status: 'active', updated_at: new Date() });
    }
    res.json({ message: 'Disposition deleted', recordsReset: recordIds.length });
  } catch (err) { next(err); }
});

// Legal Holds
router.get('/legal-holds', authorize('dispositions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holds = await dispositionsRepo.findAllLegalHolds();
    res.json({ data: holds });
  } catch (err) { next(err); }
});

router.get('/legal-holds/:recordId', authorize('dispositions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const holds = await dispositionsRepo.findLegalHolds(req.params.recordId);
    res.json({ data: holds });
  } catch (err) { next(err); }
});

router.post('/legal-holds', authorize('dispositions:write'), validate(createLegalHoldSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hold = await dispositionsRepo.createLegalHold({
      record_id: req.body.record_id,
      reason: req.body.reason,
      placed_by: req.user!.id,
      placed_at: new Date(),
      is_active: true,
    });
    res.status(201).json({ data: hold });
  } catch (err) { next(err); }
});

router.post('/legal-holds/:id/release', authorize('dispositions:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hold = await dispositionsRepo.releaseLegalHold(req.params.id, req.user!.id);
    res.json({ data: hold });
  } catch (err) { next(err); }
});

export default router;
