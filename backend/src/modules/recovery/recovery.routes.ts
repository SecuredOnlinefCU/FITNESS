import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { upsertDailyRecoveryMetric, getMyRecoveryToday, listMyRecoveryHistory } from './recovery.service';

export const recoveryRouter = Router();

recoveryRouter.get('/today', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await getMyRecoveryToday({ userId: req.user!.sub, role: req.user!.role }) });
}));

recoveryRouter.get('/history', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const days = Number(req.query.days || 30);
  res.json({ items: await listMyRecoveryHistory({ userId: req.user!.sub, role: req.user!.role }, days) });
}));

recoveryRouter.post('/metrics', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ metricDate: z.string().optional(), provider: z.string().optional(), sleepMinutes: z.number().optional(), sleepScore: z.number().optional(), restingHeartRate: z.number().optional(), hrvMs: z.number().optional(), steps: z.number().optional(), caloriesBurned: z.number().optional(), readinessScore: z.number().optional(), sourcePayloadJson: z.any().optional() }).parse(req.body);
  res.status(201).json(await upsertDailyRecoveryMetric({ userId: req.user!.sub, role: req.user!.role }, body));
}));
