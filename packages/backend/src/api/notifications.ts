import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!.id;

    const notifications = await db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);

    const [{ count }] = await db('notifications')
      .where({ user_id: userId, is_read: false })
      .count('* as count');

    res.json({ data: notifications, unreadCount: Number(count) });
  } catch (err) { next(err); }
});

router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await db('notifications')
      .where({ id: req.params.id, user_id: req.user!.id })
      .update({ is_read: true, read_at: new Date() });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;