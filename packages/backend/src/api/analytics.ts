import { Router, Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/authorize';
import { ReportService } from '../services/ReportService';
import { db } from '../config/database';

const router = Router();
const reportService = new ReportService(db);

router.get('/dashboard', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const metrics = await reportService.getDashboardMetrics(isAdmin ? undefined : req.user!.agencyId);
    res.json({ data: metrics });
  } catch (err) { next(err); }
});

// Migration status: parallel-run snapshot for the legacy → RMS cutover.
// Imported = records with a tracking_number originally minted by the legacy
// system (matched via tr_number presence). Pending mapping = records lacking
// series classification or container_number. Failed = unresolved batch_import
// audit events (resource_id is null).
router.get('/migration-status', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const agencyId = isAdmin ? undefined : req.user!.agencyId;
    const baseRecords = agencyId ? db('records').where({ agency_id: agencyId }) : db('records');

    const [importedRow] = await baseRecords.clone().whereNotNull('tr_number').count('* as count');
    const [pendingRow] = await baseRecords.clone()
      .whereNotNull('tr_number')
      .where(function () { this.whereNull('series_title').orWhereNull('container_number'); })
      .count('* as count');
    const [failedRow] = await db('audit_events')
      .where({ action: 'batch_import_failed' })
      .count('* as count');

    res.json({
      data: {
        imported: Number(importedRow.count),
        pendingMapping: Number(pendingRow.count),
        failed: Number(failedRow.count),
      },
    });
  } catch (err) { next(err); }
});

router.get('/detailed', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const agencyId = isAdmin ? undefined : req.user!.agencyId;
    const baseRecords = agencyId ? db('records').where({ agency_id: agencyId }) : db('records');

    // Records by agency
    const recordsByAgency = await db('records')
      .join('agencies', 'records.agency_id', 'agencies.id')
      .select('agencies.code as agency', 'agencies.name as agencyName')
      .count('records.id as count')
      .groupBy('agencies.code', 'agencies.name')
      .orderBy('count', 'desc');

    // Records by status
    const recordsByStatus = await baseRecords.clone()
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Records by media type
    const recordsByMediaType = await baseRecords.clone()
      .select('media_type')
      .count('* as count')
      .groupBy('media_type');

    // Transmittals by status
    const transmittalsByStatus = await db('transmittals')
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Dispositions by action
    const dispositionsByAction = await db('dispositions')
      .select('disposition_action as action', 'status')
      .count('* as count')
      .groupBy('disposition_action', 'status');

    // Storage utilization (locations)
    const storageUtilization = await db('locations')
      .where({ is_active: true })
      .whereNotNull('capacity')
      .where('capacity', '>', 0)
      .select('name', 'code', 'location_type', 'capacity', 'current_count');

    // Retention compliance: records with schedule, days until disposition
    const retentionOverview = await db('records')
      .join('retention_schedules', 'records.retention_schedule_id', 'retention_schedules.id')
      .select(
        'retention_schedules.code',
        'retention_schedules.name',
        db.raw('COUNT(records.id) as record_count'),
        'retention_schedules.retention_years',
        'retention_schedules.disposition_action'
      )
      .groupBy('retention_schedules.code', 'retention_schedules.name', 'retention_schedules.retention_years', 'retention_schedules.disposition_action')
      .orderBy('record_count', 'desc');

    // Total storage stats
    const [storageTotal] = await db('locations')
      .where({ is_active: true })
      .whereNotNull('capacity')
      .where('capacity', '>', 0)
      .select(
        db.raw('SUM(capacity) as total_capacity'),
        db.raw('SUM(current_count) as total_used')
      );

    res.json({
      data: {
        recordsByAgency,
        recordsByStatus,
        recordsByMediaType,
        transmittalsByStatus,
        dispositionsByAction,
        storageUtilization,
        retentionOverview,
        storageTotal: {
          totalCapacity: Number(storageTotal?.total_capacity || 0),
          totalUsed: Number(storageTotal?.total_used || 0),
          utilizationPercent: storageTotal?.total_capacity
            ? Math.round((Number(storageTotal.total_used) / Number(storageTotal.total_capacity)) * 100)
            : 0,
        },
      },
    });
  } catch (err) { next(err); }
});

router.get('/reports/retention', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const report = await reportService.getRetentionReport(isAdmin ? undefined : req.user!.agencyId);
    res.json({ data: report });
  } catch (err) { next(err); }
});

router.get('/reports/activity', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const days = parseInt(req.query.days as string) || 30;
    const report = await reportService.getActivityReport(isAdmin ? undefined : req.user!.agencyId, days);
    res.json({ data: report });
  } catch (err) { next(err); }
});

router.get('/export/:reportType', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportType } = req.params;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const agencyId = isAdmin ? undefined : req.user!.agencyId;

    let data: any;
    switch (reportType) {
      case 'retention':
        data = await reportService.getRetentionReport(agencyId);
        break;
      case 'activity':
        data = await reportService.getActivityReport(agencyId);
        break;
      default:
        data = await reportService.getDashboardMetrics(agencyId);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.json"`);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/reports/generate', authorize('analytics:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId, format, dateFrom, dateTo } = req.body;
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
    const agencyId = isAdmin ? undefined : req.user!.agencyId;

    const result = await reportService.generateReport(reportId, format || 'csv', agencyId, dateFrom, dateTo);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (err) { next(err); }
});

export default router;
