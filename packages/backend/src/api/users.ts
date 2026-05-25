import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { UsersRepository } from '../repositories/UsersRepository';
import { AuthService } from '../services/AuthService';
import { db } from '../config/database';

const router = Router();

const usersRepo = new UsersRepository(db);
const authService = new AuthService(usersRepo);

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  agencyId: z.string().uuid(),
  roles: z.array(z.string()).min(1),
});

const updateRolesSchema = z.object({
  roles: z.array(z.string()).min(1),
});

router.get('/', authorize('users:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('admin');
    const users = await authService.listUsers(isAdmin ? undefined : req.user!.agencyId);
    res.json({ data: users });
  } catch (err) { next(err); }
});

router.get('/:id', authorize('users:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) { next(err); }
});

router.post('/', authorize('users:write'), validate(createUserSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (err) { next(err); }
});

router.patch('/:id/roles', authorize('users:write'), validate(updateRolesSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateRoles(req.params.id, req.body.roles);
    res.json({ data: user });
  } catch (err) { next(err); }
});

router.post('/:id/deactivate', authorize('users:write'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.deactivateUser(req.params.id);
    res.json({ data: user });
  } catch (err) { next(err); }
});

export default router;
