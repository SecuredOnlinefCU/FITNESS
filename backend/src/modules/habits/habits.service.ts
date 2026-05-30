import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

export async function createHabit(actor: Actor, input: { title: string; description?: string; programId?: string; cadence?: string; targetCount?: number }) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Only coaches can create habits');
  return prisma.habitDefinition.create({
    data: {
      coachUserId: actor.userId,
      title: input.title,
      description: input.description,
      programId: input.programId,
      cadence: input.cadence ?? 'DAILY',
      targetCount: input.targetCount ?? 1,
    },
  });
}

export async function listHabits(actor: Actor) {
  return prisma.habitDefinition.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function logHabit(actor: Actor, habitDefinitionId: string, notes?: string) {
  const habit = await prisma.habitDefinition.findUnique({ where: { id: habitDefinitionId } });
  if (!habit || !habit.isActive) throw new HttpError(404, 'Habit not found');

  return prisma.habitLog.create({
    data: {
      habitDefinitionId,
      clientUserId: actor.userId,
      notes,
    },
  });
}

export async function listMyHabitLogs(actor: Actor) {
  return prisma.habitLog.findMany({
    where: { clientUserId: actor.userId },
    include: { habit: true },
    orderBy: { completedAt: 'desc' },
    take: 100,
  });
}
