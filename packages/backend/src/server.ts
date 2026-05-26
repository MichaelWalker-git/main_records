import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import knex from 'knex';
import path from 'path';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './api/auth';
import healthRouter from './api/health';
import recordsRouter from './api/records';
import transmittalsRouter from './api/transmittals';
import dispositionsRouter from './api/dispositions';
import inventoryRouter from './api/inventory';
import searchRouter from './api/search';
import analyticsRouter from './api/analytics';
import usersRouter from './api/users';
import integrationsRouter from './api/integrations';
import notificationsRouter from './api/notifications';
import templatesRouter from './api/templates';
import adminRouter from './api/admin';
import agencyRouter from './api/agency';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health check at root level for ALB/container health checks
app.use('', healthRouter);
app.use('/api', authRouter);
app.use('/api', healthRouter);

app.use('/api/records', authMiddleware, auditMiddleware, recordsRouter);
app.use('/api/transmittals', authMiddleware, auditMiddleware, transmittalsRouter);
app.use('/api/dispositions', authMiddleware, auditMiddleware, dispositionsRouter);
app.use('/api/inventory', authMiddleware, auditMiddleware, inventoryRouter);
app.use('/api/search', authMiddleware, searchRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('/api/users', authMiddleware, auditMiddleware, usersRouter);
app.use('/api/admin/users', authMiddleware, auditMiddleware, usersRouter);
app.use('/api/integrations', authMiddleware, integrationsRouter);
app.use('/api/admin/integrations', authMiddleware, integrationsRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);
app.use('/api/templates', authMiddleware, auditMiddleware, templatesRouter);
app.use('/api/admin/templates', authMiddleware, auditMiddleware, templatesRouter);
app.use('/api/admin', authMiddleware, adminRouter);
app.use('/api/agency', authMiddleware, agencyRouter);

app.use(errorHandler);

// Start server immediately so health checks pass
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.stage}]`);
});

// Run migrations in background (non-blocking)
(async () => {
  try {
    const isEcs = !!process.env.DB_HOST;
    const migrationDb = knex({
      client: 'pg',
      connection: {
        connectionString: config.databaseUrl,
        ssl: isEcs ? { rejectUnauthorized: false } : false,
      },
      pool: { min: 0, max: 1, acquireTimeoutMillis: 10000 },
      acquireConnectionTimeout: 10000,
      migrations: {
        directory: path.resolve(__dirname, '../migrations'),
      },
    });

    console.log('Running database migrations...');
    console.log('Migration directory:', path.resolve(__dirname, '../migrations'));
    console.log('Database URL (masked):', config.databaseUrl.replace(/:[^:@]+@/, ':***@'));
    const [batch, migrations] = await migrationDb.migrate.latest();
    if (migrations.length > 0) {
      console.log(`Migrations applied (batch ${batch}):`, migrations);
    } else {
      console.log('Database already up to date.');
    }
    await migrationDb.destroy();
  } catch (err: any) {
    console.error('=== MIGRATION FAILED ===');
    console.error('Error:', err?.message || err);
    if (err?.code) console.error('PG Error Code:', err.code);
  }
})();

export default app;
