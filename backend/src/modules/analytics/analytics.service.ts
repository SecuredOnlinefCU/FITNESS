import { prisma } from '../../lib/prisma';
import { getCached, setCache } from '../../common/utils/cache';
import { env } from '../../config/env';

const CACHE_TTL = 300_000;

export type AnalyticsSummary = {
  clients: { total: number; active: number; growthByMonth: { month: string; count: number }[] };
  revenue: { mrr: number; totalRevenue: number; revenueByMonth: { month: string; amountCents: number }[] };
  adherence: { avgAdherence: number; distribution: { high: number; medium: number; low: number } };
  momentum: { averageScore: number; distribution: { high: number; medium: number; low: number } };
  riskFlags: { total: number; bySeverity: { critical: number; high: number; medium: number; low: number } };
  topExercises: { exerciseName: string; count: number }[];
  completionRate: number;
};

export async function getAnalyticsSummary(coachUserId: string): Promise<AnalyticsSummary> {
  const cacheKey = `analytics:${coachUserId}`;
  const cached = getCached<AnalyticsSummary>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 86400000);

  const programIds = (
    await prisma.program.findMany({
      where: { coachUserId },
      select: { id: true },
    })
  ).map((p) => p.id);

  const clientUserIds = (
    await prisma.programMembership.findMany({
      where: { programId: { in: programIds }, status: { not: 'LEFT' } },
      select: { clientUserId: true },
      distinct: ['clientUserId'],
    })
  ).map((m) => m.clientUserId);

  const total = clientUserIds.length;

  const recentSessions = await prisma.workoutSession.findMany({
    where: { clientUserId: { in: clientUserIds }, startedAt: { gte: thirtyDaysAgo } },
    select: { clientUserId: true, status: true },
  });

  const activeClientSet = new Set(recentSessions.map((s) => s.clientUserId));
  const active = activeClientSet.size;

  const completedSessions = recentSessions.filter((s) => s.status === 'completed');
  const completionRate = recentSessions.length > 0 ? completedSessions.length / recentSessions.length : 0;

  const sessionsByClient = new Map<string, number>();
  for (const s of recentSessions) {
    sessionsByClient.set(s.clientUserId, (sessionsByClient.get(s.clientUserId) || 0) + 1);
  }

  let adherenceHigh = 0;
  let adherenceMed = 0;
  let adherenceLow = 0;
  for (const [, count] of sessionsByClient) {
    if (count >= 6) adherenceHigh++;
    else if (count >= 3) adherenceMed++;
    else adherenceLow++;
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { coachUserId, status: 'ACTIVE' },
    include: { package: true },
  });
  const mrr = subscriptions.reduce((sum, s) => sum + (s.package?.priceCents ?? 0), 0);
  const payments = await prisma.payment.findMany({
    where: { coachUserId, status: 'SUCCEEDED' },
  });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amountCents, 0);

  const revenueByMonthMap = new Map<string, number>();
  for (const p of payments) {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + p.amountCents);
  }
  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .map(([month, amountCents]) => ({ month, amountCents }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const momentumScores = await prisma.momentumScore.findMany({
    where: {
      coachUserId,
      clientUserId: { in: clientUserIds },
      snapshotDate: { gte: thirtyDaysAgo },
    },
    select: { score: true, clientUserId: true },
    orderBy: { snapshotDate: 'desc' },
  });

  const latestMomentumByClient = new Map<string, number>();
  for (const m of momentumScores) {
    if (!latestMomentumByClient.has(m.clientUserId)) {
      latestMomentumByClient.set(m.clientUserId, m.score);
    }
  }
  const momentumVals = Array.from(latestMomentumByClient.values());
  const avgMomentum = momentumVals.length > 0
    ? Math.round(momentumVals.reduce((a, b) => a + b, 0) / momentumVals.length)
    : 0;
  let momHigh = 0, momMed = 0, momLow = 0;
  for (const s of momentumVals) {
    if (s >= 70) momHigh++;
    else if (s >= 40) momMed++;
    else momLow++;
  }

  const riskFlags = await prisma.riskFlagTimelineEvent.findMany({
    where: { coachUserId, clientUserId: { in: clientUserIds } },
  });
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of riskFlags) {
    const sev = (f.severity || 'low').toLowerCase();
    if (sev === 'critical') bySeverity.critical++;
    else if (sev === 'high') bySeverity.high++;
    else if (sev === 'medium') bySeverity.medium++;
    else bySeverity.low++;
  }

  const clientGrowthByMonth = new Map<string, Set<string>>();
  const memberships = await prisma.programMembership.findMany({
    where: { programId: { in: programIds } },
    select: { clientUserId: true, joinedAt: true },
  });
  for (const m of memberships) {
    const key = `${m.joinedAt.getFullYear()}-${String(m.joinedAt.getMonth() + 1).padStart(2, '0')}`;
    if (!clientGrowthByMonth.has(key)) clientGrowthByMonth.set(key, new Set());
    clientGrowthByMonth.get(key)!.add(m.clientUserId);
  }
  const growthByMonth = Array.from(clientGrowthByMonth.entries())
    .map(([month, ids]) => ({ month, count: ids.size }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .filter((m) => m.month >= `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`);

  const topExercisesRaw = await prisma.workoutExercise.findMany({
    where: {
      workout: {
        assignments: {
          some: {
            clientUserId: { in: clientUserIds },
          },
        },
      },
    },
    select: { id: true, exercise: { select: { name: true } } },
  });

  const exerciseCounts = new Map<string, number>();
  for (const we of topExercisesRaw) {
    exerciseCounts.set(we.exercise?.name || 'Unknown', (exerciseCounts.get(we.exercise?.name || 'Unknown') || 0) + 1);
  }
  const topExercises = Array.from(exerciseCounts.entries())
    .map(([exerciseName, count]) => ({ exerciseName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const result: AnalyticsSummary = {
    clients: { total, active, growthByMonth },
    revenue: { mrr, totalRevenue, revenueByMonth },
    adherence: { avgAdherence: total > 0 ? Math.round((active / total) * 100) : 0, distribution: { high: adherenceHigh, medium: adherenceMed, low: adherenceLow } },
    momentum: { averageScore: avgMomentum, distribution: { high: momHigh, medium: momMed, low: momLow } },
    riskFlags: { total: riskFlags.length, bySeverity },
    topExercises,
    completionRate: Math.round(completionRate * 100),
  };

  setCache(cacheKey, result, CACHE_TTL);

  if (env.POWER_BI_PUSH_URL) {
    fetch(env.POWER_BI_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalClients: result.clients.total,
        activeClients: result.clients.active,
        mrrCents: result.revenue.mrr,
        totalRevenueCents: result.revenue.totalRevenue,
        avgAdherence: result.adherence.avgAdherence,
        avgMomentum: result.momentum.averageScore,
        riskFlags: result.riskFlags.total,
        completionRate: result.completionRate,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }

  return result;
}
