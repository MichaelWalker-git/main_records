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

export default router;
