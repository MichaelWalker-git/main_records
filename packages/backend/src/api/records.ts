import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { RecordsService } from '../services/RecordsService';
import { RecordsRepository } from '../repositories/RecordsRepository';
import { TemplatesRepository } from '../repositories/TemplatesRepository';
import { RetentionSchedulesRepository } from '../repositories/RetentionSchedulesRepository';
import { DispositionsRepository } from '../repositories/DispositionsRepository';
import { AIService } from '../services/AIService';
import { db } from '../config/database';

const router = Router();

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validate UUID param for all :id routes
router.param('id', (req, res, next, value) => {
  if (!UUID_REGEX.test(value)) {
    return res.status(400).json({ error: 'Invalid record ID format' });
  }
  next();
});

const recordsRepo = new RecordsRepository(db);
const templatesRepo = new TemplatesRepository(db);
const retentionRepo = new RetentionSchedulesRepository(db);
const dispositionsRepo = new DispositionsRepository(db);
const aiService = new AIService();
const recordsService = new RecordsService(recordsRepo, templatesRepo, retentionRepo, aiService);

// REC-12: Valid status transitions (state machine).
// in_transit can resolve to active (received) or checked_out (handed off externally).
export const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active'],
  active: ['checked_out', 'in_transit', 'on_hold', 'pending_disposition', 'archived', 'transferred'],
  checked_out: ['active', 'in_transit'],
  in_transit: ['active', 'checked_out'],
  on_hold: ['active'],
  pending_disposition: ['disposed', 'destroyed', 'active'],
  archived: ['active'],
  transferred: [],
  disposed: [],
  destroyed: [],
};

const createRecordSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  record_type: z.string().min(1).optional().default('general'),
  series_id: z.string().optional(),
  agency_id: z.string().optional(),
  template_id: z.string().uuid().optional(),
  retention_schedule_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  location_id: z.string().uuid().optional(),
});

const updateRecordSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'checked_out', 'in_transit', 'on_hold', 'pending_disposition', 'disposed', 'destroyed', 'archived', 'transferred']).optional(),
  record_type: z.string().min(1).optional(),
  location_code: z.string().regex(/^\d{8}$/, 'Location code must be exactly 8 digits (BBFFRRSS format)').optional(),
  container_number: z.string().max(100).optional(),
  box_number: z.string().max(100).optional(),
  series_title: z.string().max(500).optional(),
  media_type: z.string().max(100).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  retention_schedule_id: z.string().uuid().optional(),
}).strict();

const batchImportSchema = z.object({
  records: z.array(createRecordSchema).min(1).max(500),
});

router.get('/status-transitions', authorize('records:read'), (_req: Request, res: Response) => {
  res.json({ data: VALID_TRANSITIONS });
});

router.get('/', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', pageSize = '25', limit, offset, status, search } = req.query as any;
    const pg = Math.max(1, Number(page));
    const ps = Math.min(Math.max(1, Number(pageSize || limit) || 25), 500);
    const off = offset !== undefined ? Number(offset) : (pg - 1) * ps;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');

    let query = db('records')
      .leftJoin('agencies', 'records.agency_id', 'agencies.id')
      .leftJoin('locations', 'records.location_id', 'locations.id')
      .select(
        'records.*',
        'agencies.name as agency_name',
        db.raw("CASE WHEN locations.name IS NOT NULL THEN locations.name || ' (' || locations.code || ')' ELSE NULL END as location_path")
      );

    if (!isAdmin) {
      query = query.where('records.agency_id', req.user!.agencyId);
    }

    if (status) {
      query = query.where('records.status', status);
    }

    if (search) {
      const term = `%${search}%`;
      query = query.where(function () {
        this.whereILike('records.title', term)
          .orWhereILike('records.tracking_number', term)
          .orWhereILike('records.series_title', term);
      });
    }

    const countQuery = query.clone();
    const records = await query.clone().orderBy('records.created_at', 'desc').limit(ps).offset(off);
    const [countResult] = await countQuery.clearSelect().clearOrder().count('records.id as count');
    const total = Number(countResult.count);

    res.json({ data: records, total, page: pg, pageSize: ps });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsRepo.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    if (!req.user!.roles.includes('SYSTEM_ADMIN') && record.agency_id !== req.user!.agencyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Enrich with location name and agency name
    let locationPath = null;
    if (record.location_id) {
      const loc = await db('locations').where({ id: record.location_id }).first();
      if (loc) locationPath = `${loc.name} (${loc.code})`;
    } else if (record.location_code) {
      const loc = await db('locations').where({ code: record.location_code }).first();
      if (loc) locationPath = `${loc.name} (${loc.code})`;
    }
    let agencyName = null;
    if (record.agency_id) {
      const agency = await db('agencies').where({ id: record.agency_id }).first();
      if (agency) agencyName = agency.name;
    }
    res.json({ data: { ...record, location_path: locationPath, agency_name: agencyName } });
  } catch (err) { next(err); }
});

router.post('/', authorize('records:write'), validate(createRecordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsService.create(req.body, req.user!.id, req.user!.agencyId);
    res.status(201).json({ data: record });
  } catch (err) { next(err); }
});

router.put('/:id', authorize('records:write'), validate(updateRecordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await recordsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    if (!req.user!.roles.includes('SYSTEM_ADMIN') && existing.agency_id !== req.user!.agencyId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // REC-10: DISPOSED records are read-only
    if (existing.status === 'disposed') {
      return res.status(409).json({ error: 'Disposed records cannot be modified' });
    }

    // REC-09: Records on LEGAL_HOLD cannot be modified (unless admin)
    if (existing.status === 'on_hold' && !req.user!.roles.includes('SYSTEM_ADMIN')) {
      const hasHold = await dispositionsRepo.hasActiveLegalHold(req.params.id);
      if (hasHold) {
        return res.status(409).json({ error: 'Record has an active legal hold and cannot be modified' });
      }
    }

    // REC-12: Validate status transitions
    if (req.body.status && req.body.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({
          error: `Invalid status transition: ${existing.status} → ${req.body.status}`,
          allowed_transitions: allowed,
        });
      }
    }

    // REC-11: Location code changes must reference valid location
    if (req.body.location_code && req.body.location_code !== existing.location_code) {
      const location = await db('locations').where({ code: req.body.location_code }).first();
      if (!location) {
        return res.status(400).json({ error: `Location code ${req.body.location_code} does not exist` });
      }
    }

    const updated = await recordsRepo.update(req.params.id, req.body);
    res.json({ data: updated });
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('records:delete'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await recordsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Record not found' });
    if (!req.user!.roles.includes('SYSTEM_ADMIN') && existing.agency_id !== req.user!.agencyId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Clean up related disposition items and legal holds
    await dispositionsRepo.removeRecordFromDispositions(req.params.id);
    await recordsRepo.delete(req.params.id);
    res.json({ message: 'Record deleted' });
  } catch (err) { next(err); }
});

router.get('/:id/audit', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await db('audit_events')
      .where({ resource_type: 'record', resource_id: req.params.id })
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

router.get('/:id/label', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const record = await recordsRepo.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    let barcodeSvg = '';
    try {
      barcodeSvg = await recordsService.generateBarcodeSvg(req.params.id, 'code128');
    } catch { /* barcode generation optional */ }

    const e = (val: string | null | undefined, fallback = '—') => escapeHtml(val || fallback);
    const html = `<!DOCTYPE html><html><head><title>Box Label - ${e(record.container_number, record.id)}</title>
<style>
  @page { size: 4in 6in; margin: 0.25in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Inter, Arial, sans-serif; width: 4in; height: 6in; padding: 0.3in; display: flex; flex-direction: column; }
  .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 8px; margin-bottom: 10px; }
  .header h1 { font-size: 11px; color: #003366; text-transform: uppercase; letter-spacing: 1px; }
  .header h2 { font-size: 9px; color: #475569; margin-top: 2px; }
  .field { display: flex; margin-bottom: 6px; }
  .field-label { font-size: 8px; text-transform: uppercase; color: #64748b; width: 110px; flex-shrink: 0; font-weight: 600; letter-spacing: 0.5px; padding-top: 1px; }
  .field-value { font-size: 11px; color: #1e293b; font-weight: 500; flex: 1; border-bottom: 1px solid #e2e8f0; padding-bottom: 2px; }
  .barcode { text-align: center; margin-top: auto; padding-top: 10px; border-top: 1px solid #e2e8f0; }
  .barcode svg { max-width: 100%; height: 50px; }
  .barcode-id { font-size: 9px; font-family: monospace; color: #64748b; margin-top: 4px; }
  .title { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 12px; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="header">
  <h1>Maine State Archives</h1>
  <h2>Records Management System</h2>
</div>
<div class="title">${e(record.title, '')}</div>
<div class="field"><span class="field-label">Container #</span><span class="field-value">${e(record.container_number)}</span></div>
<div class="field"><span class="field-label">Location Code</span><span class="field-value">${e(record.location_code)}</span></div>
<div class="field"><span class="field-label">Agency</span><span class="field-value">${e(record.agency_code)}</span></div>
<div class="field"><span class="field-label">Box #</span><span class="field-value">${e(record.box_number)}</span></div>
<div class="field"><span class="field-label">Record Series</span><span class="field-value">${e(record.series_title)}</span></div>
<div class="field"><span class="field-label">Date Range</span><span class="field-value">${e(record.date_from)} to ${e(record.date_to)}</span></div>
<div class="field"><span class="field-label">Media Type</span><span class="field-value">${e(record.media_type)}</span></div>
<div class="field"><span class="field-label">Transmittal #</span><span class="field-value">${e(record.transmittal_number)}</span></div>
<div class="barcode">
  ${barcodeSvg}
  <div class="barcode-id">${e(record.container_number, record.id)}</div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

    res.type('text/html').send(html);
  } catch (err) { next(err); }
});

// Download: get presigned URL for document download
router.get('/:id/download', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await recordsService.getDownloadUrl(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

// Upload: get presigned URL for document upload
router.post('/:id/upload', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = req.body.filename;
    const contentType = req.body.contentType || req.body.content_type;
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
    const s3Key = req.body.s3Key || req.body.s3_key;
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

// Batch import
router.post('/batch-import', authorize('records:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided' });
    }

    const agencyId = req.user!.agencyId || 'a1b2c3d4-1111-4000-8000-000000000001';
    let imported = 0;

    for (const row of rows) {
      await recordsRepo.create({
        title: row.title,
        description: row.description || '',
        agency_id: agencyId,
        series_title: row.series || null,
        media_type: 'PHYSICAL',
        status: 'active',
        created_by: req.user!.id,
      } as any);
      imported++;
    }

    res.status(201).json({ data: { imported } });
  } catch (err) { next(err); }
});

export default router;
