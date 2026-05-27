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
  items: z.array(z.object({
    record_id: z.string().uuid().optional(),
    box_number: z.string().optional(),
    description: z.string().optional(),
    series_title: z.string().optional(),
    date_range: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

router.get('/', authorize('transmittals:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', pageSize = '25' } = req.query as any;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const transmittals = isAdmin
      ? await transmittalsRepo.findAllWithAgency(status)
      : await transmittalsRepo.findByAgency(req.user!.agencyId, status);
    const pageNum = Math.max(1, Number(page) || 1);
    const sizeNum = Math.max(1, Math.min(100, Number(pageSize) || 25));
    const total = transmittals.length;
    const totalPages = Math.max(1, Math.ceil(total / sizeNum));
    const start = (pageNum - 1) * sizeNum;
    const paged = transmittals.slice(start, start + sizeNum);
    res.json({ data: paged, total, page: pageNum, pageSize: sizeNum, totalPages });
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
    const transmittal = await db('transmittals')
      .select(
        'transmittals.*',
        'agencies.name as agency_name',
        'agencies.code as agency_code',
        'submitter.email as submitted_by_email',
        db.raw("COALESCE(submitter.first_name || ' ' || submitter.last_name, submitter.email) as submitted_by_name"),
        'receiver.email as received_by_email',
        db.raw("COALESCE(receiver.first_name || ' ' || receiver.last_name, receiver.email) as received_by_name"),
        'approver.email as approved_by_email',
        db.raw("COALESCE(approver.first_name || ' ' || approver.last_name, approver.email) as approved_by_name"),
      )
      .leftJoin('agencies', 'transmittals.agency_id', 'agencies.id')
      .leftJoin('users as submitter', 'transmittals.submitted_by', 'submitter.id')
      .leftJoin('users as receiver', 'transmittals.received_by', 'receiver.id')
      .leftJoin('users as approver', 'transmittals.approved_by', 'approver.id')
      .where({ 'transmittals.id': req.params.id })
      .first();
    if (!transmittal) return res.status(404).json({ error: 'Transmittal not found' });
    const items = await transmittalsRepo.getItems(req.params.id);
    res.json({ data: { ...transmittal, items } });
  } catch (err) { next(err); }
});

router.post('/', authorize('transmittals:write'), validate(createTransmittalSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agencyId = req.user!.agencyId || req.body.agency_id || 'a1b2c3d4-1111-4000-8000-000000000001';
    const transmittal = await transmittalsRepo.create({
      title: req.body.title,
      description: req.body.description,
      agency_id: agencyId,
      status: 'draft',
      submitted_by: req.user!.id,
      item_count: req.body.items?.length || 0,
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
