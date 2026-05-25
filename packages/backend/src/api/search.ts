import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { SearchService } from '../services/SearchService';

const router = Router();
const searchService = new SearchService();

const searchSchema = z.object({
  query: z.string().min(1),
  type: z.enum(['metadata', 'fulltext', 'semantic', 'ocr']).optional(),
  record_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  size: z.number().int().positive().max(100).optional(),
});

router.post('/', authorize('search:read'), validate(searchSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('admin');
    const results = await searchService.search({
      ...req.body,
      agency_id: isAdmin ? undefined : req.user!.agencyId,
    });
    res.json({ data: results });
  } catch (err) { next(err); }
});

router.get('/facets', authorize('search:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.roles.includes('admin');
    const facets = await searchService.getFacets(isAdmin ? undefined : req.user!.agencyId);
    res.json({ data: facets });
  } catch (err) { next(err); }
});

export default router;
