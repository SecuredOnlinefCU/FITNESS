import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function severityFromScore(score: number) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 65) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

function daysSince(date?: Date | null) {
  if (!date) return 999;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

async function listCoachClientIds(coachUserId: string) {
  const threads = await prisma.thread.findMany({ where: { coachUserId }, select: { clientUserId: true } }).catch(() => []);
  const unique = Array.from(new Set(threads.map((thread) => thread.clientUserId)));
  return unique;
}

export async function detectMissedCheckIns(actor: Actor) {
  requireCoach(actor);
  const clientIds = await listCoachClientIds(actor.userId);
  const flags = [] as any[];

  for (const expectation of expectations) {
    const dueAt = expectation.nextDueAt;
    const isMissed = dueAt ? dueAt.getTime() < Date.now() : daysSince(expectation.lastCheckInAt) > expectation.expectedEveryDays;
    if (!isMissed) continue;

    const missedDays = dueAt ? Math.max(0, daysSince(dueAt)) : daysSince(expectation.lastCheckInAt) - expectation.expectedEveryDays;
    const severity = missedDays >= 7 ? 'HIGH' : missedDays >= 3 ? 'MEDIUM' : 'LOW';

    const flag = await prisma.clientRiskFlag.upsert({
      where: {
        // If your Prisma schema does not support a composite here, replace with findFirst + create/update.
        id: `missed-checkin-${expectation.coachUserId}-${expectation.clientUserId}`,
      },
      update: {
        severity,
        title: 'Missed check-in',
        body: `Client is ${missedDays} day${missedDays === 1 ? '' : 's'} past expected check-in.`,
        status: 'OPEN',
        evidenceJson: { missedDays, nextDueAt: dueAt, expectedEveryDays: expectation.expectedEveryDays },
      },
      create: {
        id: `missed-checkin-${expectation.coachUserId}-${expectation.clientUserId}`,
        coachUserId: expectation.coachUserId,
        clientUserId: expectation.clientUserId,
        flagType: 'MISSED_CHECKIN',
        severity,
        title: 'Missed check-in',
        body: `Client is ${missedDays} day${missedDays === 1 ? '' : 's'} past expected check-in.`,
        evidenceJson: { missedDays, nextDueAt: dueAt, expectedEveryDays: expectation.expectedEveryDays },
      },
    });

    flags.push(flag);
  }

  return flags;
}

export async function calculateClientAttentionScore(input: { coachUserId: string; clientUserId: string }) {
  const snapshotDate = startOfToday();
  const [openFlags, expectation] = await Promise.all([
    prisma.clientRiskFlag.findMany({ where: { coachUserId: input.coachUserId, clientUserId: input.clientUserId, status: 'OPEN' } }),
    prisma.clientCheckInExpectation.findUnique({ where: { coachUserId_clientUserId: { coachUserId: input.coachUserId, clientUserId: input.clientUserId } } }).catch(() => null),
  ]);

  const missedCheckins = openFlags.filter((flag) => flag.flagType === 'MISSED_CHECKIN').length;
  const highFlags = openFlags.filter((flag) => ['HIGH', 'CRITICAL'].includes(flag.severity)).length;
  const inactiveDays = expectation ? daysSince(expectation.lastCheckInAt) : 0;

  let score = 0;
  score += missedCheckins * 35;
  score += highFlags * 25;
  score += Math.min(inactiveDays * 3, 30);
  score += Math.min(openFlags.length * 10, 30);
  score = Math.min(100, score);

  const severity = severityFromScore(score);

  return prisma.coachAttentionSnapshot.upsert({
    where: { coachUserId_clientUserId_snapshotDate: { coachUserId: input.coachUserId, clientUserId: input.clientUserId, snapshotDate } },
    update: {
      score,
      severity,
      missedCheckins,
      inactiveDays,
      riskFlagsOpen: openFlags.length,
      evidenceJson: { flags: openFlags.map((flag) => ({ id: flag.id, type: flag.flagType, severity: flag.severity })) },
    },
    create: {
      coachUserId: input.coachUserId,
      clientUserId: input.clientUserId,
      snapshotDate,
      score,
      severity,
      missedCheckins,
      inactiveDays,
      riskFlagsOpen: openFlags.length,
      evidenceJson: { flags: openFlags.map((flag) => ({ id: flag.id, type: flag.flagType, severity: flag.severity })) },
    },
  });
}

export async function refreshCoachAttentionQueue(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
  await detectMissedCheckIns(actor);
  const clientIds = await listCoachClientIds(actor.userId);
  const snapshots = [] as any[];
  for (const clientUserId of clientIds) {
    snapshots.push(await calculateClientAttentionScore({ coachUserId: actor.userId, clientUserId }));
  }
  return snapshots.sort((a, b) => b.score - a.score);
}

export async function getCoachAttentionQueue(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
  const snapshotDate = startOfToday();
  const existing = await prisma.coachAttentionSnapshot.findMany({
    where: { coachUserId: actor.userId, snapshotDate },
    orderBy: [{ score: 'desc' }, { updatedAt: 'desc' }],
  });
  if (existing.length) return existing;
  return refreshCoachAttentionQueue(actor);
}

export async function listClientRiskFlags(actor: Actor, clientUserId?: string) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
  return prisma.clientRiskFlag.findMany({
    where: { coachUserId: actor.userId, clientUserId, status: 'OPEN' },
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function resolveRiskFlag(actor: Actor, flagId: string) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
  return prisma.clientRiskFlag.updateMany({
    where: { id: flagId, coachUserId: actor.userId },
    data: { status: 'RESOLVED', resolvedAt: new Date() },
  });
}
