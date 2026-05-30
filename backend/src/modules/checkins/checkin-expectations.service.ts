import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

export async function upsertCheckInExpectation(actor: Actor, input: { clientUserId: string; cadence?: string; expectedEveryDays?: number; nextDueAt?: string }) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
  return prisma.clientCheckInExpectation.upsert({
    where: { coachUserId_clientUserId: { coachUserId: actor.userId, clientUserId: input.clientUserId } },
    update: {
      cadence: input.cadence ?? 'WEEKLY',
      expectedEveryDays: input.expectedEveryDays ?? 7,
      nextDueAt: input.nextDueAt ? new Date(input.nextDueAt) : undefined,
      isActive: true,
    },
    create: {
      coachUserId: actor.userId,
      clientUserId: input.clientUserId,
      cadence: input.cadence ?? 'WEEKLY',
      expectedEveryDays: input.expectedEveryDays ?? 7,
      nextDueAt: input.nextDueAt ? new Date(input.nextDueAt) : undefined,
    },
  });
}

export async function recordClientCheckIn(actor: Actor, input: { coachUserId: string }) {
  const existing = await prisma.clientCheckInExpectation.findUnique({
    where: { coachUserId_clientUserId: { coachUserId: input.coachUserId, clientUserId: actor.userId } },
  });
  if (!existing) throw new HttpError(404, 'Check-in expectation not found');

  const now = new Date();
  const nextDueAt = new Date(now.getTime() + existing.expectedEveryDays * 86400000);

  await prisma.clientRiskFlag.updateMany({
    where: { coachUserId: input.coachUserId, clientUserId: actor.userId, flagType: 'MISSED_CHECKIN', status: 'OPEN' },
    data: { status: 'RESOLVED', resolvedAt: now },
  });

  return prisma.clientCheckInExpectation.update({
    where: { coachUserId_clientUserId: { coachUserId: input.coachUserId, clientUserId: actor.userId } },
    data: { lastCheckInAt: now, nextDueAt },
  });
}
