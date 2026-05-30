import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { upsertCheckInExpectation, recordClientCheckIn } from './checkin-expectations.service';

export const checkinsRouter = Router();

checkinsRouter.post('/expectations', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ clientUserId: z.string(), cadence: z.string().optional(), expectedEveryDays: z.number().optional(), nextDueAt: z.string().optional() }).parse(req.body);
  res.json(await upsertCheckInExpectation({ userId: req.user!.sub, role: req.user!.role }, body));
}));

checkinsRouter.post('/me', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ coachUserId: z.string() }).parse(req.body);
  res.json(await recordClientCheckIn({ userId: req.user!.sub, role: req.user!.role }, body));
}));
