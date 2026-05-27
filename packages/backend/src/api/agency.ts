import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authorize } from '../middleware/authorize';
import { db } from '../config/database';

const router = Router();

router.get('/dashboard', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agencyId = req.user!.agencyId;
    const agencyFilter = agencyId ? { agency_id: agencyId } : {};

    const [transferCount] = await db('transmittals')
      .where(agencyFilter)
      .count('* as count');

    let requestCount: any = { count: 0 };
    try {
      const [rc] = await db('reference_requests')
        .where(agencyFilter)
        .count('* as count');
      requestCount = rc;
    } catch { /* table may not exist */ }

    // Count records with short retention schedules (approaching disposition)
    let alertCount: any = { count: 0 };
    try {
      const [ac] = await db('records')
        .join('retention_schedules', 'records.retention_schedule_id', 'retention_schedules.id')
        .where(agencyId ? { 'records.agency_id': agencyId } : {})
        .where('retention_schedules.retention_years', '<=', 5)
        .count('records.id as count');
      alertCount = ac;
    } catch { /* ignore */ }

    const recentTransmittals = await db('transmittals')
      .select(
        'transmittals.*',
        db.raw("'TRN-' || TO_CHAR(transmittals.created_at, 'YYYYMMDD') || '-' || LEFT(transmittals.id::text, 4) as tracking_number")
      )
      .where(agencyFilter)
      .orderBy('created_at', 'desc')
      .limit(5);

    res.json({
      data: {
        myTransfers: Number(transferCount?.count || 0),
        myRequests: Number(requestCount?.count || 0),
        retentionAlerts: Number(alertCount?.count || 0),
        recentTransmittals,
      },
    });
  } catch (err) { next(err); }
});

// Accessions (simplified - creates a transmittal with type accession)
router.post('/accessions', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, series_code, date_range, box_count, contact_name, contact_phone } = req.body;
    const agencyId = req.user!.agencyId || 'a1b2c3d4-1111-4000-8000-000000000001';

    const transmittal = await db('transmittals').insert({
      id: uuidv4(),
      title: title || 'Accession Request',
      description: description || '',
      agency_id: agencyId,
      status: 'draft',
      submitted_by: req.user!.id,
      item_count: Number(box_count) || 1,
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    res.status(201).json({ data: transmittal[0] });
  } catch (err) { next(err); }
});

// Reference Requests
router.get('/reference-requests', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agencyId = req.user!.agencyId;
    const requests = await db('reference_requests')
      .where(agencyId ? { agency_id: agencyId } : {})
      .orderBy('created_at', 'desc');
    res.json({ data: requests });
  } catch (err) { next(err); }
});

router.post('/reference-requests', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { subject, description, urgency } = req.body;
    const agencyId = req.user!.agencyId || 'a1b2c3d4-1111-4000-8000-000000000001';

    const request = await db('reference_requests').insert({
      id: uuidv4(),
      requester_name: req.user!.email || 'User',
      requester_email: req.user!.email || 'user@example.com',
      agency_id: agencyId,
      description: `${subject || 'Reference Request'}: ${description || ''}`,
      status: 'new',
      created_at: new Date(),
      updated_at: new Date(),
    }).returning('*');

    res.status(201).json({ data: request[0] });
  } catch (err) { next(err); }
});

export default router;