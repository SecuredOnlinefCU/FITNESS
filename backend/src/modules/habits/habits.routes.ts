import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { createHabit, listHabits, logHabit, listMyHabitLogs } from './habits.service';

export const habitsRouter = Router();

habitsRouter.get('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await listHabits({ userId: req.user!.sub, role: req.user!.role }) });
}));

habitsRouter.post('/', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ title: z.string().min(1), description: z.string().optional(), programId: z.string().optional(), cadence: z.string().optional(), targetCount: z.number().optional() }).parse(req.body);
  res.status(201).json(await createHabit({ userId: req.user!.sub, role: req.user!.role }, body));
}));

habitsRouter.post('/:habitDefinitionId/logs', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ notes: z.string().optional() }).parse(req.body ?? {});
  res.status(201).json(await logHabit({ userId: req.user!.sub, role: req.user!.role }, req.params.habitDefinitionId, body.notes));
}));

habitsRouter.get('/logs/me', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await listMyHabitLogs({ userId: req.user!.sub, role: req.user!.role }) });
}));
