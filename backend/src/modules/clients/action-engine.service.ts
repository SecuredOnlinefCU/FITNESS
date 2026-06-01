import { prisma } from "../../lib/prisma";

type ActionItem = {
  id: string;
  type: "CHECKIN" | "MESSAGE" | "WORKOUT_ADJUST" | "NUTRITION_ADJUST" | "RECOVERY" | "MILESTONE";
  priority: number;
  title: string;
  body: string;
  actionHref: string;
  reason: string;
};

export async function generateSmartActions(
  coachUserId: string,
  clientUserId: string
): Promise<ActionItem[]> {
  const actions: ActionItem[] = [];
  const since7d = new Date(Date.now() - 7 * 86400000);
  const since14d = new Date(Date.now() - 14 * 86400000);

  const [healthScore, momentum, sessions, habits, recovery, flags, lastCheckin] =
    await Promise.all([
      prisma.clientHealthScoreSnapshot.findFirst({
        where: { coachUserId, clientUserId },
        orderBy: { snapshotDate: "desc" },
      }),
      prisma.momentumScore.findFirst({
        where: { coachUserId, clientUserId },
        orderBy: { snapshotDate: "desc" },
      }),
      prisma.workoutSession.findMany({
        where: { clientUserId, startedAt: { gte: since14d } },
        orderBy: { startedAt: "desc" },
      }),
      prisma.habitLog.findMany({
        where: { clientUserId, completedAt: { gte: since7d } },
      }),
      prisma.dailyRecoveryMetric.findMany({
        where: { userId: clientUserId, metricDate: { gte: since7d } },
      }),
      prisma.clientRiskFlag.findMany({
        where: { coachUserId, clientUserId, status: "OPEN" },
      }),
      prisma.checkinSubmission.findFirst({
        where: { clientUserId },
        orderBy: { submittedAt: "desc" },
      }),
    ]);

  // 1. If health score is dropping, suggest check-in
  if (healthScore && healthScore.score < 60) {
    actions.push({
      id: `health-checkin-${clientUserId}`,
      type: "CHECKIN",
      priority: 95,
      title: "Schedule a check-in",
      body: `Health score is ${healthScore.score} (${healthScore.healthStatus}). Reach out to understand what's happening.`,
      actionHref: "/dashboard/messages",
      reason: `Health score dropped to ${healthScore.score}`,
    });
  }

  // 2. If momentum is falling, suggest workout review
  if (momentum && momentum.trend === "FALLING") {
    actions.push({
      id: `momentum-review-${clientUserId}`,
      type: "WORKOUT_ADJUST",
      priority: 85,
      title: "Review workout plan",
      body: `Momentum is trending down (${momentum.score}/100). Consider adjusting intensity or volume.`,
      actionHref: "/coach/workouts",
      reason: `Momentum score declined from previous period`,
    });
  }

  // 3. If no check-in in 7+ days
  const daysSinceCheckin = lastCheckin?.submittedAt
    ? Math.floor((Date.now() - lastCheckin.submittedAt.getTime()) / 86400000)
    : 999;
  if (daysSinceCheckin >= 7) {
    actions.push({
      id: `overdue-checkin-${clientUserId}`,
      type: "CHECKIN",
      priority: 90,
      title: "Check-in overdue",
      body: `Last check-in was ${daysSinceCheckin} days ago. Send a reminder.`,
      actionHref: "/dashboard/messages",
      reason: `${daysSinceCheckin} days since last check-in`,
    });
  }

  // 4. If recovery is consistently low, suggest deload
  const avgReadiness = recovery.length > 0
    ? recovery.reduce((s, r) => s + (r.readinessScore ?? 50), 0) / recovery.length
    : 50;
  if (avgReadiness < 40 && recovery.length >= 3) {
    actions.push({
      id: `recovery-deload-${clientUserId}`,
      type: "RECOVERY",
      priority: 80,
      title: "Consider deload week",
      body: `Average readiness is ${Math.round(avgReadiness)}/100 over ${recovery.length} days. Client may need reduced load.`,
      actionHref: "/coach/workouts",
      reason: `Low recovery scores for ${recovery.length} consecutive days`,
    });
  }

  // 5. If habit adherence is low, send encouragement
  const activeHabits = await prisma.habitDefinition.count({ where: { isActive: true } });
  if (activeHabits > 0) {
    const adherence = habits.length / (activeHabits * 7);
    if (adherence < 0.4) {
      actions.push({
        id: `habit-support-${clientUserId}`,
        type: "MESSAGE",
        priority: 75,
        title: "Send habit support message",
        body: `Habit adherence is ${Math.round(adherence * 100)}%. A supportive message can help re-engage.`,
        actionHref: "/dashboard/messages",
        reason: `Low habit adherence: ${Math.round(adherence * 100)}%`,
      });
    }
  }

  // 6. Milestone: if completed 10+ sessions in 2 weeks
  const completedRecent = sessions.filter((s) => s.status === "completed").length;
  if (completedRecent >= 10) {
    actions.push({
      id: `milestone-10-${clientUserId}`,
      type: "MILESTONE",
      priority: 60,
      title: "Celebrate a milestone!",
      body: `Client completed ${completedRecent} sessions in 2 weeks. Send a congratulatory message.`,
      actionHref: "/dashboard/messages",
      reason: `${completedRecent} sessions completed in 14 days`,
    });
  }

  // 7. If there are open high-severity risk flags
  const highFlags = flags.filter((f) => f.severity === "HIGH" || f.severity === "CRITICAL");
  if (highFlags.length > 0) {
    actions.push({
      id: `risk-flags-${clientUserId}`,
      type: "CHECKIN",
      priority: 88,
      title: "Address risk flags",
      body: `${highFlags.length} high-severity risk flag(s) open. Review and resolve.`,
      actionHref: "/coach/client-health",
      reason: `${highFlags.length} high-severity flags`,
    });
  }

  return actions.sort((a, b) => b.priority - a.priority);
}
