import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import knex from 'knex';
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
app.use('/api/integrations', authMiddleware, integrationsRouter);
app.use('/api/notifications', authMiddleware, notificationsRouter);

app.use(errorHandler);

async function start() {
  // Auto-run migrations on startup using same connection as the app
  try {
    const db = knex({
      client: 'pg',
      connection: config.databaseUrl,
      migrations: {
        directory: '../migrations',
      },
    });

    console.log('Running database migrations...');
    const [batch, migrations] = await db.migrate.latest();
    if (migrations.length > 0) {
      console.log(`Migrations applied (batch ${batch}):`, migrations);
    } else {
      console.log('Database already up to date.');
    }
    await db.destroy();
  } catch (err) {
    console.error('Migration failed (server will start anyway):', err);
  }

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.stage}]`);
  });
}

start();

export default app;
