import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { getAnalyticsSummary } from './analytics.service';
import { clearCache } from '../../common/utils/cache';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get('/summary', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const summary = await getAnalyticsSummary(req.user!.sub);
  res.json(summary);
}));

analyticsRouter.post('/cache/clear', asyncHandler(async (_req, res) => {
  clearCache('analytics:');
  res.json({ cleared: true });
}));
