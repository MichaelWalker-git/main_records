import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { LocationsRepository } from '../repositories/LocationsRepository';
import { CirculationRepository } from '../repositories/CirculationRepository';
import { RecordsRepository } from '../repositories/RecordsRepository';
import { InventoryService } from '../services/InventoryService';
import { db } from '../config/database';

const router = Router();

const locationsRepo = new LocationsRepository(db);
const circulationRepo = new CirculationRepository(db);
const recordsRepo = new RecordsRepository(db);
const inventoryService = new InventoryService(locationsRepo, circulationRepo, recordsRepo);

const createLocationSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  parent_id: z.string().uuid().optional(),
  location_type: z.enum(['building', 'floor', 'room', 'shelf', 'box']),
  capacity: z.number().int().positive(),
  agency_id: z.string().uuid().optional(),
});

const checkoutSchema = z.object({
  record_id: z.string().uuid(),
  due_date: z.string().datetime(),
  notes: z.string().optional(),
});

router.get('/locations', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parent_id } = req.query as any;
    const locations = await inventoryService.getLocationTree(parent_id);
    res.json({ data: locations });
  } catch (err) { next(err); }
});

router.get('/locations/:id', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await locationsRepo.findById(req.params.id);
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json({ data: location });
  } catch (err) { next(err); }
});

router.post('/locations', authorize('inventory:write'), validate(createLocationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await inventoryService.createLocation(req.body);
    res.status(201).json({ data: location });
  } catch (err) { next(err); }
});

router.get('/locations/:id/utilization', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const utilization = await inventoryService.getUtilization(req.params.id);
    res.json({ data: utilization });
  } catch (err) { next(err); }
});

router.post('/checkout', authorize('inventory:write'), validate(checkoutSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await inventoryService.checkout(
      req.body.record_id,
      req.user!.id,
      req.user!.agencyId,
      new Date(req.body.due_date),
      req.body.notes
    );
    res.status(201).json({ data: event });
  } catch (err) { next(err); }
});

router.post('/checkin', authorize('inventory:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { record_id, notes } = req.body;
    const event = await inventoryService.checkin(record_id, notes);
    res.json({ data: event });
  } catch (err) { next(err); }
});

router.get('/overdue', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('admin');
    const overdue = await inventoryService.getOverdue(isAdmin ? undefined : req.user!.agencyId);
    res.json({ data: overdue });
  } catch (err) { next(err); }
});

router.get('/circulation/:recordId', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await inventoryService.getCirculationHistory(req.params.recordId);
    res.json({ data: history });
  } catch (err) { next(err); }
});

export default router;
