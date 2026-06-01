import { prisma } from '../../lib/prisma';

export type ClientSegment = 'ON_TRACK' | 'SLIPPING' | 'AT_RISK';

export async function getClientSegment(clientUserId: string): Promise<ClientSegment> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

  const [workoutsDone, workoutsTotal, habitsDone, habitsTotal, lastCheckIn, lastComment] = await Promise.all([
    prisma.workoutSession.count({ where: { clientUserId, status: 'completed', completedAt: { gte: sevenDaysAgo } } }),
    prisma.workoutAssignment.count({ where: { clientUserId, status: 'assigned', createdAt: { gte: sevenDaysAgo } } }),
    prisma.habitLog.count({ where: { clientUserId, completedAt: { gte: sevenDaysAgo } } }),
    prisma.habitDefinition.count({ where: { isActive: true, logs: { some: { clientUserId } } } }),
    prisma.checkinSubmission.findFirst({ where: { clientUserId }, orderBy: { submittedAt: 'desc' } }),
    prisma.feedComment.findFirst({ where: { authorUserId: clientUserId }, orderBy: { createdAt: 'desc' } }),
  ]);

  const adherence = workoutsTotal > 0 ? workoutsDone / workoutsTotal : 0;
  const habitAdherence = habitsTotal > 0 ? habitsDone / habitsTotal : 0;
  const lastInteraction = [lastCheckIn?.submittedAt, lastComment?.createdAt]
    .filter(Boolean).sort().reverse()[0];
  const daysSinceInteraction = lastInteraction
    ? Math.floor((now.getTime() - new Date(lastInteraction).getTime()) / 86400000)
    : 999;

  if (adherence < 0.4 || daysSinceInteraction > 5) return 'AT_RISK';
  if (adherence < 0.7 || habitAdherence < 0.5 || daysSinceInteraction > 3) return 'SLIPPING';
  return 'ON_TRACK';
}

export async function getMomentum(clientUserId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [workoutsDone, workoutsTotal, habitsDone, habitsTotal,
    checkInsDone, checkInsExpected, mealsLogged, mealsTarget,
    reactionCount, commentCount] = await Promise.all([
    prisma.workoutSession.count({ where: { clientUserId, status: 'completed', completedAt: { gte: sevenDaysAgo } } }),
    prisma.workoutAssignment.count({ where: { clientUserId, status: 'assigned', createdAt: { gte: sevenDaysAgo } } }),
    prisma.habitLog.count({ where: { clientUserId, completedAt: { gte: sevenDaysAgo } } }),
    prisma.habitDefinition.count({ where: { isActive: true, logs: { some: { clientUserId } } } }),
    prisma.checkinSubmission.count({ where: { clientUserId, submittedAt: { gte: sevenDaysAgo } } }),
    prisma.clientCheckInExpectation.count({ where: { clientUserId, isActive: true } }),
    prisma.mealLog.count({ where: { clientUserId, mealTime: { gte: sevenDaysAgo } } }),
    21,
    prisma.feedReaction.count({ where: { userId: clientUserId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.feedComment.count({ where: { authorUserId: clientUserId, createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const workoutScore = workoutsTotal > 0 ? Math.round((workoutsDone / workoutsTotal) * 30) : 15;
  const habitScore = habitsTotal > 0 ? Math.round((habitsDone / Math.max(habitsTotal * 7, 1)) * 25) : 10;
  const checkInScore = checkInsExpected > 0 ? Math.round((checkInsDone / checkInsExpected) * 20) : 10;
  const engagementScore = Math.min(Math.round(((reactionCount + commentCount) / 10) * 15), 15);
  const nutritionScore = Math.min(Math.round((mealsLogged / mealsTarget) * 10), 10);

  const score = Math.min(workoutScore + habitScore + checkInScore + engagementScore + nutritionScore, 100);

  return {
    score,
    breakdown: [
      { label: 'Workouts', score: workoutScore, max: 30 },
      { label: 'Habits', score: habitScore, max: 25 },
      { label: 'Check-ins', score: checkInScore, max: 20 },
      { label: 'Engagement', score: engagementScore, max: 15 },
      { label: 'Nutrition', score: nutritionScore, max: 10 },
    ],
  };
}

export type CoachNudge = {
  id: string;
  type: 'CHECK_IN_REMINDER' | 'ACHIEVEMENT_CELEBRATION' | 'ADHERENCE_ALERT' | 'POST_PERFORMANCE' | 'BEST_TIME_TO_POST';
  clientName?: string;
  clientId?: string;
  reason: string;
  action: { type: string; label: string };
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export async function getCoachNudges(coachUserId: string): Promise<CoachNudge[]> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const memberships = await prisma.programMembership.findMany({
    where: { program: { coachUserId }, status: 'active' },
    include: { clientUser: { select: { id: true, firstName: true, lastName: true } } },
  });

  const nudges: CoachNudge[] = [];
  let id = 0;

  for (const m of memberships) {
    const clientId = m.clientUser.id;
    const name = `${m.clientUser.firstName ?? ''} ${m.clientUser.lastName ?? ''}`.trim() || 'Client';

    const [lastComment, lastCheckIn, habitCount, lastSession] = await Promise.all([
      prisma.feedComment.findFirst({ where: { authorUserId: clientId }, orderBy: { createdAt: 'desc' } }),
      prisma.checkinSubmission.findFirst({ where: { clientUserId: clientId }, orderBy: { submittedAt: 'desc' } }),
      prisma.habitLog.count({ where: { clientUserId: clientId, completedAt: { gte: sevenDaysAgo } } }),
      prisma.workoutSession.findFirst({ where: { clientUserId: clientId }, orderBy: { completedAt: 'desc' } }),
    ]);

    const lastDates = [lastComment?.createdAt, lastCheckIn?.submittedAt, lastSession?.completedAt].filter(Boolean) as Date[];
    const mostRecent = lastDates.sort((a, b) => b.getTime() - a.getTime())[0];
    const daysSince = mostRecent ? Math.floor((now.getTime() - mostRecent.getTime()) / 86400000) : 999;

    if (daysSince > 5) {
      nudges.push({
        id: `nudge-${id++}`, type: 'CHECK_IN_REMINDER', clientName: name, clientId,
        reason: `Last interaction: ${daysSince} days ago`,
        action: { type: 'SEND_CHECK_IN', label: 'Send check-in' },
        priority: daysSince > 7 ? 'critical' : 'high',
      });
    }

    const recentMilestone = await prisma.feedPost.findFirst({
      where: { authorUserId: clientId, type: 'MILESTONE', createdAt: { gte: sevenDaysAgo } },
    });
    const streak = await prisma.habitLog.count({ where: { clientUserId: clientId, completedAt: { gte: new Date(now.getTime() - 7 * 86400000) } } });
    if (streak >= 5 && !recentMilestone) {
      nudges.push({
        id: `nudge-${id++}`, type: 'ACHIEVEMENT_CELEBRATION', clientName: name, clientId,
        reason: `${streak}-day habit streak worth celebrating`,
        action: { type: 'CREATE_MILESTONE', label: 'Create post' },
        priority: 'medium',
      });
    }

    if (nudges.length >= 15) break;
  }

  const priorityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  return nudges.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]).slice(0, 10);
}

export type PostAnalytics = {
  views: number;
  reactions: number;
  comments: number;
  engagementRate: number;
  avgEngagementRate: number;
};

export async function getPostAnalytics(postId: string, programId: string): Promise<PostAnalytics> {
  const [reactions, comments, clientCount] = await Promise.all([
    prisma.feedReaction.count({ where: { postId } }),
    prisma.feedComment.count({ where: { postId } }),
    prisma.programMembership.count({ where: { programId, status: 'active' } }),
  ]);
  const views = Math.max(reactions + comments, Math.round(clientCount * 0.6));
  const engagementRate = clientCount > 0 ? Math.round(((reactions + comments) / clientCount) * 100) : 0;
  return { views, reactions, comments, engagementRate, avgEngagementRate: 35 };
}

function getActionForPost(post: { type: string; metaJson?: any; authorUserId: string }, clientUserId?: string) {
  switch (post.type) {
    case 'WORKOUT_ASSIGNED':
      return { type: 'START_WORKOUT', label: 'Start workout', href: '/client/workouts' };
    case 'CHECK_IN_PROMPT':
      return { type: 'CHECK_IN', label: 'Check in', apiEndpoint: '/api/checkins' };
    case 'MILESTONE':
      return { type: 'VIEW_STREAK', label: 'See my progress', href: '/client/progress' };
    case 'RECOVERY_ALERT':
      return { type: 'LOG_RECOVERY', label: 'Log how I feel', apiEndpoint: '/api/recovery/log' };
    case 'CHALLENGE_UPDATE':
      return { type: 'VIEW_LEADERBOARD', label: 'See leaderboard', href: '/client/progress' };
    case 'NUTRITION_HACK':
      return { type: 'LOG_MEAL', label: 'Log a meal', apiEndpoint: '/api/nutrition/meals' };
    case 'PROGRESS_SPOTLIGHT':
      return { type: 'COMPARE_PHOTO', label: 'View comparison', href: '/client/progress' };
    default:
      return null;
  }
}

export async function detectMilestones(clientUserId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const existing = await prisma.feedPost.findFirst({
    where: { authorUserId: clientUserId, type: 'MILESTONE', createdAt: { gte: today } },
  });
  if (existing) return;

  const [habitStreak, workoutCount, sessionsCompleted] = await Promise.all([
    prisma.habitLog.count({ where: { clientUserId, completedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.workoutSession.count({ where: { clientUserId, status: 'completed' } }),
    prisma.workoutSession.count({ where: { clientUserId, status: 'completed', completedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
  ]);

  const milestones: { bodyText: string; metaJson: any }[] = [];
  if (habitStreak >= 7 && habitStreak % 7 === 0) milestones.push({ bodyText: `🔥 ${habitStreak}-day habit streak!`, metaJson: { milestoneType: 'STREAK', value: habitStreak } });
  if (sessionsCompleted >= 10 && sessionsCompleted % 10 === 0) milestones.push({ bodyText: `🏋️ ${workoutCount} workouts completed — keep going!`, metaJson: { milestoneType: 'WORKOUT', value: workoutCount } });
  if (milestones.length === 0) return;

  const coach = await prisma.program.findFirst({
    where: { memberships: { some: { clientUserId } } },
    select: { coachUserId: true },
  });

  for (const m of milestones) {
    await prisma.feedPost.create({
      data: {
        authorUserId: clientUserId,
        scopeType: 'PROGRAM',
        scopeId: '', // will be set by caller
        type: 'MILESTONE',
        bodyText: m.bodyText,
        metaJson: m.metaJson,
      },
    });
  }
}

export { getActionForPost };
