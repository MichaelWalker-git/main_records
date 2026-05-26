import { Router, Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/authorize';
import { TemplatesRepository } from '../repositories/TemplatesRepository';
import { db } from '../config/database';

const router = Router();
const templatesRepo = new TemplatesRepository(db);

router.get('/', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agencyId = req.user!.roles.includes('SYSTEM_ADMIN') ? undefined : req.user!.agencyId;
    const templates = await templatesRepo.findActive(agencyId);
    res.json({ data: templates });
  } catch (err) { next(err); }
});

router.post('/', authorize('admin:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, agency_id, fields } = req.body;
    const template = await templatesRepo.create({
      name,
      description: description || '',
      agency_id: agency_id || null,
      field_definitions: JSON.stringify(fields || []),
      is_active: true,
    });
    res.status(201).json({ data: template });
  } catch (err) { next(err); }
});

router.put('/:id', authorize('admin:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await templatesRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    const { name, description, agency_id, fields } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (agency_id !== undefined) updateData.agency_id = agency_id || null;
    if (fields !== undefined) updateData.field_definitions = JSON.stringify(fields);
    updateData.updated_at = new Date();

    const template = await templatesRepo.update(req.params.id, updateData);
    res.json({ data: template });
  } catch (err) { next(err); }
});

router.delete('/:id', authorize('admin:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await templatesRepo.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    await templatesRepo.update(req.params.id, { is_active: false, updated_at: new Date() } as any);
    res.json({ message: 'Template deactivated' });
  } catch (err) { next(err); }
});

export default router;