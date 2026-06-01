import { prisma } from "../../lib/prisma";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function trendFromDelta(current: number, previous: number): "RISING" | "FALLING" | "STABLE" {
  const delta = current - previous;
  if (delta > 3) return "RISING";
  if (delta < -3) return "FALLING";
  return "STABLE";
}

export async function calculateMomentumScore(input: {
  coachUserId: string;
  clientUserId: string;
}) {
  const { coachUserId, clientUserId } = input;
  const snapshotDate = startOfToday();
  const since14d = daysAgo(14);
  const since7d = daysAgo(7);

  const [sessions, metrics, habits, recovery, riskFlags, healthSnapshot] =
    await Promise.all([
      prisma.workoutSession.findMany({
        where: { clientUserId, startedAt: { gte: since14d } },
        orderBy: { startedAt: "desc" },
      }),
      prisma.metricEntry.findMany({
        where: { clientUserId, recordedAt: { gte: since14d } },
        orderBy: { recordedAt: "desc" },
      }),
      prisma.habitLog.findMany({
        where: { clientUserId, completedAt: { gte: since7d } },
      }),
      prisma.dailyRecoveryMetric.findMany({
        where: { userId: clientUserId, metricDate: { gte: since7d } },
        orderBy: { metricDate: "desc" },
      }),
      prisma.clientRiskFlag.findMany({
        where: { coachUserId, clientUserId, status: "OPEN" },
      }),
      prisma.clientHealthScoreSnapshot.findFirst({
        where: { coachUserId, clientUserId },
        orderBy: { snapshotDate: "desc" },
      }),
    ]);

  // Performance Score (0-100): workout completion rate + consistency
  const totalAssignments = await prisma.workoutAssignment.count({
    where: {
      clientUserId,
      assignedByUserId: coachUserId,
      assignedForDate: { gte: since14d },
    },
  });
  const completedSessions = sessions.filter((s) => s.status === "completed").length;
  const completionRate = totalAssignments > 0 ? completedSessions / totalAssignments : 0.5;
  const consistencyBonus = sessions.length >= 8 ? 10 : sessions.length >= 4 ? 5 : 0;
  const performanceScore = Math.min(100, Math.round(completionRate * 80 + consistencyBonus + (healthSnapshot?.progressScore ?? 50) * 0.1));

  // Behavior Score (0-100): habit adherence + logging consistency
  const activeHabits = await prisma.habitDefinition.count({ where: { isActive: true } });
  const habitRate = activeHabits > 0 ? habits.length / (activeHabits * 7) : 0.5;
  const metricLoggingDays = new Set(metrics.map((m) => m.recordedAt?.toDateString())).size;
  const loggingRate = Math.min(1, metricLoggingDays / 14);
  const behaviorScore = Math.min(100, Math.round(habitRate * 60 + loggingRate * 40));

  // Engagement Score (0-100): check-ins, messaging, active days
  const checkinSubmissions = await prisma.checkinSubmission.count({
    where: { clientUserId, submittedAt: { gte: since14d } },
  });
  const messageThreads = await prisma.thread.findMany({
    where: { OR: [{ coachUserId: clientUserId }, { clientUserId }] },
    select: { id: true },
  });
  const threadIds = messageThreads.map((t) => t.id);
  const recentMessages = threadIds.length > 0
    ? await prisma.message.count({
        where: { threadId: { in: threadIds }, createdAt: { gte: since7d } },
      })
    : 0;
  const engagementScore = Math.min(100, Math.round(
    Math.min(1, checkinSubmissions / 2) * 40 +
    Math.min(1, recentMessages / 5) * 30 +
    (healthSnapshot?.engagementScore ?? 50) * 0.3
  ));

  // Recovery Score (0-100): sleep, HRV, readiness
  const avgReadiness = recovery.length > 0
    ? recovery.reduce((sum, r) => sum + (r.readinessScore ?? 50), 0) / recovery.length
    : 50;
  const avgSleep = recovery.length > 0
    ? recovery.reduce((sum, r) => sum + (r.sleepMinutes ?? 420), 0) / recovery.length
    : 420;
  const sleepBonus = avgSleep >= 420 ? 10 : avgSleep < 360 ? -10 : 0;
  const recoveryScore = Math.min(100, Math.max(0, Math.round(avgReadiness + sleepBonus)));

  // Composite Momentum Score
  const riskPenalty = riskFlags.length * 5;
  const raw = Math.round(
    performanceScore * 0.35 +
    behaviorScore * 0.25 +
    engagementScore * 0.25 +
    recoveryScore * 0.15
  );
  const score = Math.max(0, Math.min(100, raw - riskPenalty));

  // Trend: compare to yesterday's snapshot
  const yesterday = daysAgo(1);
  const prevSnapshot = await prisma.momentumScore.findFirst({
    where: { clientUserId, coachUserId, snapshotDate: { lt: snapshotDate } },
    orderBy: { snapshotDate: "desc" },
  });
  const trend = prevSnapshot ? trendFromDelta(score, prevSnapshot.score) : "STABLE";

  const snapshot = await prisma.momentumScore.upsert({
    where: {
      clientUserId_coachUserId_snapshotDate: {
        clientUserId,
        coachUserId,
        snapshotDate,
      },
    },
    update: {
      score,
      trend,
      performanceScore,
      behaviorScore,
      engagementScore,
      recoveryScore,
      evidenceJson: {
        completionRate,
        habitRate,
        loggingRate,
        avgReadiness,
        avgSleep,
        riskFlags: riskFlags.length,
        sessionsCompleted: completedSessions,
        totalAssignments,
      },
    },
    create: {
      clientUserId,
      coachUserId,
      score,
      trend,
      performanceScore,
      behaviorScore,
      engagementScore,
      recoveryScore,
      snapshotDate,
      evidenceJson: {
        completionRate,
        habitRate,
        loggingRate,
        avgReadiness,
        avgSleep,
        riskFlags: riskFlags.length,
        sessionsCompleted: completedSessions,
        totalAssignments,
      },
    },
  });

  return snapshot;
}

export async function getMomentumHistory(
  coachUserId: string,
  clientUserId: string,
  days = 30
) {
  const since = daysAgo(days);
  return prisma.momentumScore.findMany({
    where: { coachUserId, clientUserId, snapshotDate: { gte: since } },
    orderBy: { snapshotDate: "asc" },
  });
}
