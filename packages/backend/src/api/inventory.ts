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

const updateLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  location_type: z.enum(['building', 'floor', 'room', 'shelf', 'box']).optional(),
  capacity: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
});

const checkoutSchema = z.object({
  record_id: z.string().uuid(),
  purpose: z.string().min(1, 'Purpose is required for checkout'),
  due_date: z.string().datetime().refine(
    (val) => new Date(val) > new Date(),
    { message: 'Due date must be in the future' }
  ),
  notes: z.string().optional(),
});

router.get('/utilization', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await db('locations')
      .where({ is_active: true, location_type: 'building' })
      .whereNotNull('capacity')
      .where('capacity', '>', 0)
      .select('name', 'code', 'capacity', 'current_count');

    const warehouses = locations.map((l: any) => ({
      name: l.name,
      capacity: Number(l.capacity),
      occupied: Number(l.current_count || 0),
    }));

    const [mediaTypes] = await db.raw(`
      SELECT media_type as type, COUNT(*) as count
      FROM records
      WHERE media_type IS NOT NULL
      GROUP BY media_type
    `);

    const totalCapacity = warehouses.reduce((s: number, w: any) => s + w.capacity, 0);
    const totalOccupied = warehouses.reduce((s: number, w: any) => s + w.occupied, 0);

    res.json({
      data: {
        warehouses,
        byType: mediaTypes?.rows ?? mediaTypes ?? [],
        totalCapacity,
        totalOccupied,
      },
    });
  } catch (err) { next(err); }
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
    if (req.body.parent_id) {
      const parent = await locationsRepo.findById(req.body.parent_id);
      if (!parent) return res.status(400).json({ error: 'Parent location not found' });
    }
    const location = await inventoryService.createLocation(req.body);
    res.status(201).json({ data: location });
  } catch (err) { next(err); }
});

router.put('/locations/:id', authorize('inventory:write'), validate(updateLocationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await locationsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Location not found' });
    if (req.body.parent_id && req.body.parent_id !== existing.parent_id) {
      if (req.body.parent_id === req.params.id) {
        return res.status(400).json({ error: 'Location cannot be its own parent' });
      }
      const parent = await locationsRepo.findById(req.body.parent_id);
      if (!parent) return res.status(400).json({ error: 'Parent location not found' });
    }
    const updated = await locationsRepo.update(req.params.id, { ...req.body, updated_at: new Date() });
    res.json({ data: updated });
  } catch (err) { next(err); }
});

router.delete('/locations/:id', authorize('inventory:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await locationsRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Location not found' });
    const children = await db('locations').where({ parent_id: req.params.id, is_active: true }).count<{ count: string }[]>('id as count').first();
    const childCount = Number(children?.count ?? 0);
    if (childCount > 0) {
      return res.status(409).json({ error: `Cannot deactivate: ${childCount} active child location(s) exist` });
    }
    await locationsRepo.update(req.params.id, { is_active: false, updated_at: new Date() });
    res.status(204).send();
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
      req.body.purpose,
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
    const isAdmin = req.user!.roles.includes('SYSTEM_ADMIN');
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

router.post('/scan', authorize('inventory:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { barcode } = req.body;
    if (!barcode) return res.status(400).json({ error: 'Barcode is required' });

    // Search by tracking number or container number
    const record = await db('records')
      .where('tracking_number', barcode)
      .orWhere('container_number', barcode)
      .first();

    if (!record) {
      return res.json({ data: { message: `No record found for barcode: ${barcode}`, action: 'not_found' } });
    }

    res.json({
      data: {
        record,
        message: `Found: ${record.title}`,
        action: record.status === 'checked_out' ? 'checkin_available' : 'checkout_available',
      },
    });
  } catch (err) { next(err); }
});

export default router;
