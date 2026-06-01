import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

function requireCoach(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) {
    throw new HttpError(403, 'Coach access required');
  }
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function healthStatus(score: number) {
  if (score < 40) return 'CRITICAL';
  if (score < 65) return 'HIGH';
  if (score < 80) return 'MEDIUM';
  return 'LOW';
}

async function listCoachClientIds(coachUserId: string) {
  const threads = await prisma.thread.findMany({ where: { coachUserId }, select: { clientUserId: true } }).catch(() => []);
  return Array.from(new Set(threads.map((thread) => thread.clientUserId)));
}

export async function calculateClientHealthScore(input: { coachUserId: string; clientUserId: string }) {
  const snapshotDate = startOfToday();
  const flags = await prisma.clientRiskFlag.findMany({ where: { coachUserId: input.coachUserId, clientUserId: input.clientUserId, status: 'OPEN' } });

  const hasLowAdherence = flags.some((flag) => flag.flagType === 'LOW_ADHERENCE');
  const hasStalledProgress = flags.some((flag) => flag.flagType === 'STALLED_PROGRESS');
  const hasPaymentRisk = flags.some((flag) => flag.flagType === 'PAYMENT_RISK');
  const hasMissedCheckin = flags.some((flag) => flag.flagType === 'MISSED_CHECKIN');
  const criticalCount = flags.filter((flag) => flag.severity === 'CRITICAL').length;
  const highCount = flags.filter((flag) => flag.severity === 'HIGH').length;

  const adherenceScore = hasLowAdherence ? 45 : 100;
  const progressScore = hasStalledProgress ? 50 : 100;
  const engagementScore = hasMissedCheckin ? 55 : 100;
  const paymentScore = hasPaymentRisk ? 50 : 100;
  const riskPenalty = Math.min(35, criticalCount * 20 + highCount * 10 + flags.length * 4);

  const baseScore = Math.round((adherenceScore + progressScore + engagementScore + paymentScore) / 4);
  const score = Math.max(0, Math.min(100, baseScore - riskPenalty));
  const status = healthStatus(score);

  const snapshot = await prisma.clientHealthScoreSnapshot.upsert({
    where: { coachUserId_clientUserId_snapshotDate: { coachUserId: input.coachUserId, clientUserId: input.clientUserId, snapshotDate } },
    update: {
      score,
      healthStatus: status,
      adherenceScore,
      progressScore,
      engagementScore,
      paymentScore,
      riskPenalty,
      evidenceJson: { flags: flags.map((flag) => ({ id: flag.id, type: flag.flagType, severity: flag.severity })) },
    },
    create: {
      coachUserId: input.coachUserId,
      clientUserId: input.clientUserId,
      snapshotDate,
      score,
      healthStatus: status,
      adherenceScore,
      progressScore,
      engagementScore,
      paymentScore,
      riskPenalty,
      evidenceJson: { flags: flags.map((flag) => ({ id: flag.id, type: flag.flagType, severity: flag.severity })) },
    },
  });

  await prisma.riskFlagTimelineEvent.create({
    data: {
      coachUserId: input.coachUserId,
      clientUserId: input.clientUserId,
      eventType: 'SCORE_CHANGED',
      title: `Client health score updated to ${score}`,
      body: `Health status: ${status}`,
      severity: status,
      metadataJson: { score, status, adherenceScore, progressScore, engagementScore, paymentScore, riskPenalty },
    },
  });

  return snapshot;
}

export async function refreshClientHealthScores(actor: Actor) {
  requireCoach(actor);
  const clientIds = await listCoachClientIds(actor.userId);
  const snapshots = [] as any[];
  for (const clientUserId of clientIds) {
    snapshots.push(await calculateClientHealthScore({ coachUserId: actor.userId, clientUserId }));
  }
  return snapshots.sort((a, b) => a.score - b.score);
}

export async function getClientHealthScores(actor: Actor) {
  requireCoach(actor);
  const snapshotDate = startOfToday();
  const existing = await prisma.clientHealthScoreSnapshot.findMany({ where: { coachUserId: actor.userId, snapshotDate }, orderBy: { score: 'asc' } });
  if (existing.length) {
    const clientIds = [...new Set(existing.map(s => s.clientUserId))];
    const users = await prisma.user.findMany({ where: { id: { in: clientIds } }, select: { id: true, firstName: true, lastName: true, email: true } });
    const userMap = new Map(users.map(u => [u.id, u]));
    return existing.map(s => ({ ...s, clientUser: userMap.get(s.clientUserId) ?? null }));
  }
  return refreshClientHealthScores(actor);
}

export async function getClientHealthDetail(actor: Actor, clientUserId: string) {
  requireCoach(actor);
  const score = await calculateClientHealthScore({ coachUserId: actor.userId, clientUserId });
  const flags = await prisma.clientRiskFlag.findMany({ where: { coachUserId: actor.userId, clientUserId, status: 'OPEN' }, orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }] });
  const timeline = await prisma.riskFlagTimelineEvent.findMany({ where: { coachUserId: actor.userId, clientUserId }, orderBy: { createdAt: 'desc' }, take: 50 });
  const recommendations = await prisma.coachActionRecommendation.findMany({ where: { coachUserId: actor.userId, clientUserId, status: 'OPEN' }, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }] });
  return { score, flags, timeline, recommendations };
}
