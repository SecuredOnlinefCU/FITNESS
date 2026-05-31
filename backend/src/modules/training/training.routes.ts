
import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth, AuthenticatedRequest, requireRole } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/async-handler';

export const trainingRouter = Router();
trainingRouter.use(requireAuth);

trainingRouter.get('/exercises', asyncHandler(async (_req, res) => res.json({ items: await prisma.exercise.findMany({ take: 100 }) })));

trainingRouter.post('/exercises', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.status(201).json(await prisma.exercise.create({ data: { coachUserId: req.user!.sub, name: req.body.name, instructions: req.body.instructions, muscleGroups: req.body.muscleGroups || req.body.muscleGroup, equipment: req.body.equipment } }))
));

trainingRouter.get('/workouts', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const where: Record<string, unknown> = {};
  if (req.user!.role === 'coach' || req.user!.role === 'assistant_coach') where.coachUserId = req.user!.sub;
  res.json({
    items: await prisma.workout.findMany({
      where,
      include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    }),
  });
}));

trainingRouter.get('/workouts/:id', asyncHandler(async (req, res) => {
  const workout = await prisma.workout.findUnique({
    where: { id: req.params.id },
    include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
  });
  if (!workout) { res.status(404).json({ error: 'Workout not found' }); return; }
  res.json(workout);
}));

trainingRouter.post('/workouts', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.status(201).json(await prisma.workout.create({
    data: {
      coachUserId: req.user!.sub,
      title: req.body.title,
      description: req.body.description,
      programId: req.body.programId,
      exercises: req.body.exercises ? { create: req.body.exercises } : undefined,
    },
    include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
  }))
));

trainingRouter.put('/workouts/:id', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.workout.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.coachUserId !== req.user!.sub) { res.status(404).json({ error: 'Workout not found' }); return; }
  await prisma.workoutExercise.deleteMany({ where: { workoutId: req.params.id } });
  res.json(await prisma.workout.update({
    where: { id: req.params.id },
    data: {
      title: req.body.title,
      description: req.body.description,
      programId: req.body.programId,
      exercises: req.body.exercises ? { create: req.body.exercises } : undefined,
    },
    include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
  }));
}));

trainingRouter.delete('/workouts/:id', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.workout.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.coachUserId !== req.user!.sub) { res.status(404).json({ error: 'Workout not found' }); return; }
  await prisma.workout.delete({ where: { id: req.params.id } });
  res.status(204).end();
}));

trainingRouter.post('/assignments', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.status(201).json(await prisma.workoutAssignment.create({ data: { workoutId: req.body.workoutId, clientUserId: req.body.clientUserId, assignedByUserId: req.user!.sub, assignedForDate: req.body.assignedForDate ? new Date(req.body.assignedForDate) : undefined } }))
));

trainingRouter.get('/assignments', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const where: Record<string, unknown> = {};
  if (req.user!.role === 'coach' || req.user!.role === 'assistant_coach') where.assignedByUserId = req.user!.sub;
  if (req.user!.role === 'client') where.clientUserId = req.user!.sub;
  res.json({
    items: await prisma.workoutAssignment.findMany({
      where,
      include: { sessions: true },
      orderBy: { createdAt: 'desc' },
    }),
  });
}));

trainingRouter.get('/client-assignments', requireRole(['client']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({
    items: await prisma.workoutAssignment.findMany({
      where: { clientUserId: req.user!.sub },
      include: { sessions: true },
      orderBy: { createdAt: 'desc' },
    }),
  });
}));

trainingRouter.post('/assignments/:assignmentId/start', requireRole(['client']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.status(201).json(await prisma.workoutSession.create({ data: { assignmentId: req.params.assignmentId, clientUserId: req.user!.sub, offlineCreated: Boolean(req.body?.offlineCreated) } }))
));

trainingRouter.get('/sessions/:sessionId', asyncHandler(async (req, res) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: req.params.sessionId },
    include: {
      sets: { orderBy: { setNumber: 'asc' } },
      assignment: true,
    },
  });
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  let workout = null;
  if (session.assignment?.workoutId) {
    workout = await prisma.workout.findUnique({ where: { id: session.assignment.workoutId }, include: { exercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } } });
  }
  res.json({ ...session, assignment: session.assignment ? { ...session.assignment, workout } : null });
}));

trainingRouter.post('/sessions/:sessionId/complete', requireRole(['client']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const session = await prisma.workoutSession.findFirst({ where: { id: req.params.sessionId, clientUserId: req.user!.sub } });
  if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
  res.json(await prisma.workoutSession.update({ where: { id: req.params.sessionId }, data: { status: 'completed', completedAt: new Date() }, include: { sets: true } }));
}));

trainingRouter.post('/sessions/:sessionId/sets', requireRole(['client']), asyncHandler(async (req, res) =>
  res.status(201).json(await prisma.setLog.create({ data: { sessionId: req.params.sessionId, ...req.body } }))
));

trainingRouter.get('/history', requireRole(['client']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.json({
    items: await prisma.workoutSession.findMany({
      where: { clientUserId: req.user!.sub },
      include: { sets: { orderBy: { setNumber: 'asc' } }, assignment: true },
      orderBy: { startedAt: 'desc' },
    }),
  })
));

trainingRouter.get('/programs', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) =>
  res.json({ items: await prisma.program.findMany({ where: { coachUserId: req.user!.sub }, orderBy: { name: 'asc' } }) })
));

trainingRouter.get('/coach-clients', requireRole(['coach', 'assistant_coach']), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const threads = await prisma.thread.findMany({ where: { coachUserId: req.user!.sub }, select: { clientUserId: true } });
  const clientIds = [...new Set(threads.map(t => t.clientUserId))];
  const users = await prisma.user.findMany({ where: { id: { in: clientIds } }, select: { id: true, firstName: true, lastName: true, email: true } });
  res.json({ items: users });
}));
