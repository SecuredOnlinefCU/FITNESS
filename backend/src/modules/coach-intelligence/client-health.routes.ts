import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { getClientHealthScores, refreshClientHealthScores, getClientHealthDetail } from './client-health-score.service';
import { generateCoachActionRecommendations, completeCoachActionRecommendation } from './coach-action-recommendations.service';

export const clientHealthRouter = Router();

clientHealthRouter.get('/scores', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await getClientHealthScores({ userId: req.user!.sub, role: req.user!.role }) });
}));

clientHealthRouter.post('/scores/refresh', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await refreshClientHealthScores({ userId: req.user!.sub, role: req.user!.role }) });
}));

clientHealthRouter.get('/clients/:clientUserId', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await getClientHealthDetail({ userId: req.user!.sub, role: req.user!.role }, req.params.clientUserId));
}));

clientHealthRouter.post('/recommendations/generate', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await generateCoachActionRecommendations({ userId: req.user!.sub, role: req.user!.role }, req.body?.clientUserId) });
}));

clientHealthRouter.post('/recommendations/:recommendationId/complete', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await completeCoachActionRecommendation({ userId: req.user!.sub, role: req.user!.role }, req.params.recommendationId));
}));
