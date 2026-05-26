import { Router } from 'express';
import { db } from '../config/database';

const router = Router();

// Health check endpoint - available at both /api/health (via app.use('/api', ...))
// and /health (mounted directly in server.ts for container/ALB health checks)
router.get('/health', async (req, res, next) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    // Return healthy even if DB is down — container should stay running
    // while DB is starting up (Aurora Serverless cold start can take 30s)
    res.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'unavailable',
    });
  }
});

export default router;
