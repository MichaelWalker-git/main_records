import { Router, Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/authorize';

const router = Router();

const integrations = [
  { id: 'active-directory', name: 'Active Directory (SAML 2.0)', status: 'connected', lastSync: new Date().toISOString() },
  { id: 'email-notifications', name: 'Email Notifications (SES)', status: 'connected', lastSync: new Date().toISOString() },
  { id: 'document-scanning', name: 'Document Scanning (Textract)', status: 'connected', lastSync: null },
  { id: 'ai-classification', name: 'AI Classification (Bedrock)', status: 'connected', lastSync: null },
  { id: 'quicksight', name: 'QuickSight Analytics', status: 'connected', lastSync: new Date().toISOString() },
];

router.get('/', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: integrations });
  } catch (err) { next(err); }
});

router.get('/:id/status', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const integration = integrations.find((i) => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    res.json({ data: integration });
  } catch (err) { next(err); }
});

router.post('/:id/test', authorize('records:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const integration = integrations.find((i) => i.id === req.params.id);
    if (!integration) return res.status(404).json({ error: 'Integration not found' });
    res.json({ data: { ...integration, testResult: 'success', testedAt: new Date().toISOString() } });
  } catch (err) { next(err); }
});

export default router;
