import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { generateCoachAdaptiveWorkoutWarnings, listWorkoutWarnings, resolveWorkoutWarning } from './workout-warning-signals.service';

export const workoutWarningsRouter = Router();

workoutWarningsRouter.post('/generate', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await generateCoachAdaptiveWorkoutWarnings({ userId: req.user!.sub, role: req.user!.role }) });
}));

workoutWarningsRouter.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await listWorkoutWarnings({ userId: req.user!.sub, role: req.user!.role }, req.query.clientUserId as string | undefined) });
}));

workoutWarningsRouter.post('/:warningId/resolve', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await resolveWorkoutWarning({ userId: req.user!.sub, role: req.user!.role }, req.params.warningId));
}));
