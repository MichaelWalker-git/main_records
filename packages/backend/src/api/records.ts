import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { RecordsService } from '../services/RecordsService';
import { RecordsRepository } from '../repositories/RecordsRepository';
import { TemplatesRepository } from '../repositories/TemplatesRepository';
import { RetentionSchedulesRepository } from '../repositories/RetentionSchedulesRepository';
import { AIService } from '../services/AIService';
import { db } from '../config/database';

const router = Router();

const recordsRepo = new RecordsRepository(db);
const templatesRepo = new TemplatesRepository(db);
const retentionRepo = new RetentionSchedulesRepository(db);
const aiService = new AIService();
const recordsService = new RecordsService(recordsRepo, templatesRepo, retentionRepo, aiService);

const createRecordSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  record_type: z.string().min(1),
  template_id: z.string().uuid().optional(),
  retention_schedule_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  location_id: z.string().uuid().optional(),
});

const batchImportSchema = z.object({
  records: z.array(createRecordSchema).min(1).max(500),
});

router.get('/', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = '50', offset = '0' } = req.query as any;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const records = isAdmin
      ? await recordsRepo.findAll({}, Number(limit), Number(offset))
      : await recordsRepo.findByAgency(req.user!.agencyId, Number(limit), Number(offset));
    res.json({ data: records });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsRepo.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (!req.user!.roles.includes('SYSTEM_ADMIN') && record.agency_id !== req.user!.agencyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ data: record });
  } catch (err) { next(err); }
});

router.post('/', authorize('records:write'), validate(createRecordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsService.create(req.body, req.user!.id, req.user!.agencyId);
    res.status(201).json({ data: record });
  } catch (err) { next(err); }
});

router.put('/:id', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await recordsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    if (!req.user!.roles.includes('SYSTEM_ADMIN') && existing.agency_id !== req.user!.agencyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const updated = await recordsRepo.update(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('records:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await recordsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    await recordsRepo.delete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) { next(err); }
});

router.get('/:id/audit', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await db('audit_events')
      .where({ entity_type: 'record', entity_id: req.params.id })
      .orderBy('created_at', 'desc')
      .limit(50);
    res.json({ data: events });
  } catch (err) { next(err); }
});

router.post('/batch', authorize('records:write'), validate(batchImportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await recordsService.batchImport(req.body.records, req.user!.id, req.user!.agencyId);
    res.status(201).json({ data: records, count: records.length });
  } catch (err) { next(err); }
});

router.post('/:id/classify', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recordsService.triggerClassification(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id/barcode', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = (req.query.format as string) === 'qrcode' ? 'qrcode' : 'code128';
    const svg = await recordsService.generateBarcodeSvg(req.params.id, format);
    res.type('image/svg+xml').send(svg);
  } catch (err) { next(err); }
});

router.get('/scan/:barcode', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsService.lookupByBarcode(req.params.barcode);
    res.json({ data: record });
  } catch (err) { next(err); }
});

// Upload: get presigned URL for document upload
router.post('/:id/upload', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }
    const result = await recordsService.getUploadUrl(req.params.id, filename, contentType);
    res.json(result);
  } catch (err) { next(err); }
});

// Upload: confirm upload completed, trigger OCR
router.post('/:id/upload/confirm', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { s3Key } = req.body;
    if (!s3Key) {
      return res.status(400).json({ error: 's3Key is required' });
    }
    const result = await recordsService.confirmUpload(req.params.id, s3Key);
    res.json(result);
  } catch (err) { next(err); }
});

router.patch('/:id/retention', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schedule_id } = req.body;
    const record = await recordsService.assignRetention(req.params.id, schedule_id);
    res.json({ data: record });
  } catch (err) { next(err); }
});

export default router;
