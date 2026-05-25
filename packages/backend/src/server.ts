import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { auditMiddleware } from './middleware/audit';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './api/health';
import recordsRouter from './api/records';
import transmittalsRouter from './api/transmittals';
import dispositionsRouter from './api/dispositions';
import inventoryRouter from './api/inventory';
import searchRouter from './api/search';
import analyticsRouter from './api/analytics';
import usersRouter from './api/users';
import integrationsRouter from './api/integrations';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

app.use('/api', healthRouter);

app.use('/api/records', authMiddleware, auditMiddleware, recordsRouter);
app.use('/api/transmittals', authMiddleware, auditMiddleware, transmittalsRouter);
app.use('/api/dispositions', authMiddleware, auditMiddleware, dispositionsRouter);
app.use('/api/inventory', authMiddleware, auditMiddleware, inventoryRouter);
app.use('/api/search', authMiddleware, searchRouter);
app.use('/api/analytics', authMiddleware, analyticsRouter);
app.use('/api/users', authMiddleware, auditMiddleware, usersRouter);
app.use('/api/integrations', authMiddleware, integrationsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} [${config.stage}]`);
});

export default app;
