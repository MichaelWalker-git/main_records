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
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const dispositions = isAdmin
      ? await dispositionsRepo.findAll()
      : await dispositionsRepo.findByAgency(req.user!.agencyId);
    res.json({ data: dispositions });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('dispositions:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const disposition = await dispositionsRepo.findById(req.params.id);
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

// Legal Holds
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
