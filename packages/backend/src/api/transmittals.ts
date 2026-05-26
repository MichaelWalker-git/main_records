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

const createTransmittalSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  items: z.array(z.object({ record_id: z.string().uuid(), notes: z.string().optional() })).optional(),
});

router.get('/', authorize('transmittals:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as any;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const transmittals = isAdmin
      ? await transmittalsRepo.findAll(status ? { status } : {})
      : await transmittalsRepo.findByAgency(req.user!.agencyId, status);
    res.json({ data: transmittals });
  } catch (err) { next(err); }
});

router.get('/pending', authorize('transmittals:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pending = await transmittalsRepo.findPendingApproval();
    res.json({ data: pending });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('transmittals:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transmittal = await transmittalsRepo.findById(req.params.id);
    if (!transmittal) return res.status(404).json({ error: 'Transmittal not found' });
    const items = await transmittalsRepo.getItems(req.params.id);
    res.json({ data: { ...transmittal, items } });
  } catch (err) { next(err); }
});

router.post('/', authorize('transmittals:write'), validate(createTransmittalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transmittal = await transmittalsRepo.create({
      title: req.body.title,
      description: req.body.description,
      agency_id: req.user!.agencyId,
      status: 'draft',
      created_by: req.user!.id,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    if (req.body.items?.length) {
      await transmittalsRepo.addItems(transmittal.id, req.body.items);
    }

    res.status(201).json({ data: transmittal });
  } catch (err) { next(err); }
});

router.post('/:id/submit', authorize('transmittals:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await workflowService.submitTransmittal(req.params.id, req.user!.id);
    res.json({ data: result });
  } catch (err) { next(err); }
});

router.post('/:id/approve', authorize('transmittals:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await workflowService.approveTransmittal(req.params.id, req.user!.id);
    res.json({ data: result });
  } catch (err) { next(err); }
});

router.post('/:id/reject', authorize('transmittals:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const result = await workflowService.rejectTransmittal(req.params.id, req.user!.id, reason);
    res.json({ data: result });
  } catch (err) { next(err); }
});

router.post('/:id/receive', authorize('transmittals:approve'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await workflowService.receiveTransmittal(req.params.id, req.user!.id);
    res.json({ data: result });
  } catch (err) { next(err); }
});

export default router;
