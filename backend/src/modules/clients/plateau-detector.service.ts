import { prisma } from "../../lib/prisma";

type PlateauResult = {
  exerciseId: string;
  exerciseName: string;
  status: "PLATEAU" | "DECLINING" | "IMPROVING";
  currentMax: number;
  previousMax: number;
  changePercent: number;
  weeksAtLevel: number;
};

function epley1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export async function detectPlateaus(clientUserId: string): Promise<PlateauResult[]> {
  const since90d = new Date(Date.now() - 90 * 86400000);
  const since45d = new Date(Date.now() - 45 * 86400000);

  const sessions = await prisma.workoutSession.findMany({
    where: { clientUserId, startedAt: { gte: since90d }, status: "completed" },
    include: { sets: true },
    orderBy: { startedAt: "desc" },
  });

  // Group sets by exercise
  const exerciseHistory = new Map<string, { date: Date; best1RM: number }[]>();

  for (const session of sessions) {
    const sessionDate = session.startedAt ?? new Date();
    for (const set of session.sets) {
      if (set.reps == null || set.weight == null) continue;
      const est1RM = epley1RM(set.weight, set.reps);
      const existing = exerciseHistory.get(set.workoutExerciseId) ?? [];
      existing.push({ date: sessionDate, best1RM: est1RM });
      exerciseHistory.set(set.workoutExerciseId, existing);
    }
  }

  const results: PlateauResult[] = [];

  for (const [workoutExerciseId, history] of exerciseHistory) {
    if (history.length < 4) continue; // Need at least 4 data points

    // Get exercise name
    const we = await prisma.workoutExercise.findUnique({
      where: { id: workoutExerciseId },
      include: { exercise: { select: { name: true } } },
    });
    if (!we?.exercise) continue;

    // Split into recent (last 45d) vs previous (45-90d)
    const recent = history.filter((h) => h.date >= since45d);
    const previous = history.filter((h) => h.date < since45d && h.date >= since90d);

    const recentMax = recent.length > 0 ? Math.max(...recent.map((h) => h.best1RM)) : 0;
    const prevMax = previous.length > 0 ? Math.max(...previous.map((h) => h.best1RM)) : recentMax;

    const changePercent = prevMax > 0 ? ((recentMax - prevMax) / prevMax) * 100 : 0;

    // Count weeks at current level (within 5% of max)
    const maxRecent = Math.max(...recent.map((h) => h.best1RM));
    const weeksAtLevel = recent.filter(
      (h) => h.best1RM >= maxRecent * 0.95
    ).length;

    let status: "PLATEAU" | "DECLINING" | "IMPROVING";
    if (changePercent < -5) status = "DECLINING";
    else if (changePercent < 2 && weeksAtLevel >= 3) status = "PLATEAU";
    else status = "IMPROVING";

    results.push({
      exerciseId: we.exerciseId,
      exerciseName: we.exercise.name,
      status,
      currentMax: Math.round(recentMax),
      previousMax: Math.round(prevMax),
      changePercent: Math.round(changePercent * 10) / 10,
      weeksAtLevel,
    });
  }

  return results.sort((a, b) => {
    if (a.status === "PLATEAU" && b.status !== "PLATEAU") return -1;
    if (a.status === "DECLINING" && b.status !== "DECLINING") return -1;
    return 0;
  });
}

export async function getOvertrainingRisk(clientUserId: string) {
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since14d = new Date(Date.now() - 14 * 86400000);

  const [recentSessions, recentRecovery, recentRPE] = await Promise.all([
    prisma.workoutSession.count({
      where: { clientUserId, startedAt: { gte: since7d }, status: "completed" },
    }),
    prisma.dailyRecoveryMetric.findMany({
      where: { userId: clientUserId, metricDate: { gte: since7d } },
    }),
    prisma.setLog.findMany({
      where: {
        session: { clientUserId, startedAt: { gte: since14d } },
        rpe: { not: null },
      },
      select: { rpe: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const avgReadiness = recentRecovery.length > 0
    ? recentRecovery.reduce((s, r) => s + (r.readinessScore ?? 50), 0) / recentRecovery.length
    : 50;
  const avgRPE = recentRPE.length > 0
    ? recentRPE.reduce((s, r) => s + (r.rpe ?? 7), 0) / recentRPE.length
    : 7;

  let risk: "LOW" | "MODERATE" | "HIGH" = "LOW";
  let reason = "Normal training load";

  if (recentSessions >= 7 && avgReadiness < 40) {
    risk = "HIGH";
    reason = `${recentSessions} sessions this week with low readiness (${Math.round(avgReadiness)})`;
  } else if (recentSessions >= 6 || (avgRPE >= 9 && avgReadiness < 50)) {
    risk = "MODERATE";
    reason = `High session count (${recentSessions}) or elevated RPE with declining readiness`;
  }

  return { risk, reason, sessionsThisWeek: recentSessions, avgReadiness: Math.round(avgReadiness), avgRPE: Math.round(avgRPE * 10) / 10 };
}
