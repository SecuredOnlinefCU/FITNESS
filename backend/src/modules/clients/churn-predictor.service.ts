import { prisma } from "../../lib/prisma";

type ChurnRisk = {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  factors: { factor: string; weight: number; detail: string }[];
};

export async function predictChurnRisk(
  coachUserId: string,
  clientUserId: string
): Promise<ChurnRisk> {
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since14d = new Date(Date.now() - 14 * 86400000);
  const since30d = new Date(Date.now() - 30 * 86400000);

  const factors: ChurnRisk["factors"] = [];
  let riskScore = 0;

  // Factor 1: Declining session frequency
  const sessionsLast7 = await prisma.workoutSession.count({
    where: { clientUserId, startedAt: { gte: since7d }, status: "completed" },
  });
  const sessionsPrev7 = await prisma.workoutSession.count({
    where: {
      clientUserId,
      startedAt: { gte: new Date(Date.now() - 14 * 86400000), lt: since7d },
      status: "completed",
    },
  });
  if (sessionsLast7 < sessionsPrev7 && sessionsPrev7 > 0) {
    const drop = ((sessionsPrev7 - sessionsLast7) / sessionsPrev7) * 100;
    const weight = Math.round(drop * 0.3);
    riskScore += weight;
    factors.push({ factor: "DECLINING_WORKOUTS", weight, detail: `Sessions dropped ${Math.round(drop)}% week-over-week` });
  }

  // Factor 2: Missed check-ins
  const missedCheckins = await prisma.clientRiskFlag.count({
    where: { coachUserId, clientUserId, flagType: "MISSED_CHECKIN", status: "OPEN" },
  });
  if (missedCheckins > 0) {
    const weight = Math.min(25, missedCheckins * 10);
    riskScore += weight;
    factors.push({ factor: "MISSED_CHECKINS", weight, detail: `${missedCheckins} missed check-in(s)` });
  }

  // Factor 3: Low habit adherence
  const activeHabits = await prisma.habitDefinition.count({ where: { isActive: true } });
  const habitLogs = await prisma.habitLog.count({
    where: { clientUserId, completedAt: { gte: since7d } },
  });
  if (activeHabits > 0) {
    const adherence = habitLogs / (activeHabits * 7);
    if (adherence < 0.5) {
      const weight = Math.round((0.5 - adherence) * 40);
      riskScore += weight;
      factors.push({ factor: "LOW_HABIT_ADHERENCE", weight, detail: `${Math.round(adherence * 100)}% habit adherence this week` });
    }
  }

  // Factor 4: Declining recovery
  const recentRecovery = await prisma.dailyRecoveryMetric.findMany({
    where: { userId: clientUserId, metricDate: { gte: since14d } },
    orderBy: { metricDate: "desc" },
  });
  if (recentRecovery.length >= 4) {
    const firstHalf = recentRecovery.slice(0, Math.floor(recentRecovery.length / 2));
    const secondHalf = recentRecovery.slice(Math.floor(recentRecovery.length / 2));
    const avgFirst = firstHalf.reduce((s, r) => s + (r.readinessScore ?? 50), 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, r) => s + (r.readinessScore ?? 50), 0) / secondHalf.length;
    if (avgSecond < avgFirst - 10) {
      const weight = Math.round((avgFirst - avgSecond) * 0.3);
      riskScore += weight;
      factors.push({ factor: "DECLINING_RECOVERY", weight, detail: `Readiness dropped from ${Math.round(avgFirst)} to ${Math.round(avgSecond)}` });
    }
  }

  // Factor 5: Open risk flags
  const openFlags = await prisma.clientRiskFlag.count({
    where: { coachUserId, clientUserId, status: "OPEN" },
  });
  if (openFlags > 2) {
    const weight = Math.min(20, (openFlags - 2) * 7);
    riskScore += weight;
    factors.push({ factor: "MULTIPLE_RISK_FLAGS", weight, detail: `${openFlags} open risk flags` });
  }

  // Factor 6: No recent messaging
  const threads = await prisma.thread.findMany({
    where: { OR: [{ coachUserId: clientUserId }, { clientUserId }] },
    select: { id: true },
  });
  const threadIds = threads.map((t) => t.id);
  const recentMessages = threadIds.length > 0
    ? await prisma.message.count({
        where: { threadId: { in: threadIds }, createdAt: { gte: since14d } },
      })
    : 0;
  if (recentMessages === 0) {
    riskScore += 15;
    factors.push({ factor: "NO_COMMUNICATION", weight: 15, detail: "No messages in 14 days" });
  }

  riskScore = Math.min(100, riskScore);

  let level: ChurnRisk["level"];
  if (riskScore >= 70) level = "CRITICAL";
  else if (riskScore >= 50) level = "HIGH";
  else if (riskScore >= 25) level = "MEDIUM";
  else level = "LOW";

  return { level, score: riskScore, factors: factors.sort((a, b) => b.weight - a.weight) };
}
