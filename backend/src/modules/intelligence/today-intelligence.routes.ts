import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { getClientToday, completeRecommendation } from './today-intelligence.service';

export const todayIntelligenceRouter = Router();

todayIntelligenceRouter.get('/today', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await getClientToday({ userId: req.user!.sub, role: req.user!.role }));
}));

todayIntelligenceRouter.post('/today/recommendations/:recommendationId/complete', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await completeRecommendation({ userId: req.user!.sub, role: req.user!.role }, req.params.recommendationId));
}));
