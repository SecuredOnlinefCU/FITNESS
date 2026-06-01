import { prisma } from '../../lib/prisma';

type Actor = { userId: string; role: string };

function todayStart() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function buildClientTodaySnapshot(actor: Actor) {
  const clientUserId = actor.userId;
  const snapshotDate = todayStart();

  const [tasks, notifications, habits] = await Promise.all([
    prisma.taskAssignment.findMany({ where: { clientUserId, status: { not: 'COMPLETED' } } }).catch(() => []),
    prisma.notification.findMany({ where: { userId: clientUserId, openedAt: null } }).catch(() => []),
    prisma.habitLog.findMany({ where: { clientUserId, completedAt: { gte: snapshotDate } } }),
  ]);

  const activeHabits = await prisma.habitDefinition.findMany({ where: { isActive: true } });

  const snapshot = await prisma.dailyClientSnapshot.upsert({
    where: { clientUserId_snapshotDate: { clientUserId, snapshotDate } },
    update: {
      openTasks: tasks.length,
      unreadMessages: notifications.length,
      habitsCompleted: habits.length,
      habitTarget: activeHabits.length,
    },
    create: {
      clientUserId,
      snapshotDate,
      openTasks: tasks.length,
      unreadMessages: notifications.length,
      habitsCompleted: habits.length,
      habitTarget: activeHabits.length,
    },
  });

  return snapshot;
}

export async function generateTodayRecommendations(actor: Actor) {
  const snapshot = await buildClientTodaySnapshot(actor);
  const clientUserId = actor.userId;

  const recommendations: Array<{ recommendationType: string; title: string; body?: string; priority: number; actionHref?: string; reasonJson?: any }> = [];

  if (snapshot.openTasks > 0) {
    recommendations.push({
      recommendationType: 'TASK',
      title: 'Complete your open task',
      body: `You have ${snapshot.openTasks} open task${snapshot.openTasks === 1 ? '' : 's'} waiting.`,
      priority: 90,
      actionHref: '/client/tasks',
      reasonJson: { openTasks: snapshot.openTasks },
    });
  }

  if (snapshot.habitTarget > 0 && snapshot.habitsCompleted < snapshot.habitTarget) {
    recommendations.push({
      recommendationType: 'HABIT',
      title: 'Keep today’s habit loop moving',
      body: `${snapshot.habitsCompleted}/${snapshot.habitTarget} habits completed today.`,
      priority: 80,
      actionHref: '/client/today',
      reasonJson: { habitsCompleted: snapshot.habitsCompleted, habitTarget: snapshot.habitTarget },
    });
  }

  if (snapshot.unreadMessages > 0) {
    recommendations.push({
      recommendationType: 'MESSAGE',
      title: 'Review coach updates',
      body: `You have ${snapshot.unreadMessages} unread update${snapshot.unreadMessages === 1 ? '' : 's'}.`,
      priority: 70,
      actionHref: '/dashboard/messages',
      reasonJson: { unreadMessages: snapshot.unreadMessages },
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      recommendationType: 'RECOVERY',
      title: 'Stay consistent today',
      body: 'No urgent coaching actions. Keep the day simple and consistent.',
      priority: 50,
      actionHref: '/client/home',
      reasonJson: { noUrgentActions: true },
    });
  }

  await prisma.todayRecommendation.updateMany({
    where: { clientUserId, status: 'OPEN' },
    data: { status: 'DISMISSED', dismissedAt: new Date() },
  });

  await prisma.todayRecommendation.createMany({
    data: recommendations.map((item) => ({
      clientUserId,
      recommendationType: item.recommendationType,
      title: item.title,
      body: item.body,
      priority: item.priority,
      actionHref: item.actionHref,
      reasonJson: item.reasonJson ?? {},
    })),
  });

  return prisma.todayRecommendation.findMany({
    where: { clientUserId, status: 'OPEN' },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function getClientToday(actor: Actor) {
  const [snapshot, recommendations] = await Promise.all([
    buildClientTodaySnapshot(actor),
    generateTodayRecommendations(actor),
  ]);

  const completionScore = snapshot.habitTarget > 0
    ? Math.round((snapshot.habitsCompleted / snapshot.habitTarget) * 100)
    : 0;

  const clientUserId = actor.userId;
  const [streakData, todayWorkout] = await Promise.all([
    prisma.dailyClientSnapshot.findMany({
      where: { clientUserId },
      orderBy: { snapshotDate: 'desc' },
      take: 30,
    }),
    prisma.workoutAssignment.findFirst({
      where: { clientUserId, assignedForDate: todayStart() },
      include: { workout: { include: { exercises: true } } },
    }),
  ]);

  const streak = streakData.filter(s => s.habitsCompleted >= (s.habitTarget || 1)).length;

  return {
    snapshot,
    recommendations,
    completionScore,
    streak,
    todayWorkout: todayWorkout?.workout ? {
      title: todayWorkout.workout.title,
      exerciseCount: todayWorkout.workout.exercises?.length ?? 0,
      estimatedDuration: Math.round((todayWorkout.workout.exercises?.length ?? 0) * 5),
    } : null,
  };
}

export async function completeRecommendation(actor: Actor, recommendationId: string) {
  return prisma.todayRecommendation.updateMany({
    where: { id: recommendationId, clientUserId: actor.userId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
}
