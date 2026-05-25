import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
});

export default router;
