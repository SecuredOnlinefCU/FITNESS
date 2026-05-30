import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { getCoachAttentionQueue, refreshCoachAttentionQueue, listClientRiskFlags, resolveRiskFlag, detectMissedCheckIns } from './coach-attention.service';

export const coachIntelligenceRouter = Router();

coachIntelligenceRouter.get('/attention-queue', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await getCoachAttentionQueue({ userId: req.user!.sub, role: req.user!.role }) });
}));

coachIntelligenceRouter.post('/attention-queue/refresh', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await refreshCoachAttentionQueue({ userId: req.user!.sub, role: req.user!.role }) });
}));

coachIntelligenceRouter.post('/missed-checkins/detect', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await detectMissedCheckIns({ userId: req.user!.sub, role: req.user!.role }) });
}));

coachIntelligenceRouter.get('/risk-flags', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await listClientRiskFlags({ userId: req.user!.sub, role: req.user!.role }, req.query.clientUserId as string | undefined) });
}));

coachIntelligenceRouter.post('/risk-flags/:flagId/resolve', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await resolveRiskFlag({ userId: req.user!.sub, role: req.user!.role }, req.params.flagId));
}));
