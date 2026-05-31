import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

function requireCoach(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
}

function dayStart(dateInput?: string | Date) {
  const date = dateInput ? new Date(dateInput) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function listCoachClientIds(coachUserId: string) {
  const threads = await prisma.thread.findMany({ where: { coachUserId }, select: { clientUserId: true } }).catch(() => []);
  return Array.from(new Set(threads.map((thread) => thread.clientUserId)));
}

async function upsertWarning(input: { coachUserId?: string; clientUserId: string; warningType: string; severity: string; title: string; body: string; metricDate?: Date; evidenceJson: any }) {
  const id = `${input.warningType.toLowerCase()}-${input.clientUserId}-${input.metricDate?.toISOString().slice(0, 10) ?? 'today'}`;
  const existing = await prisma.workoutWarningSignal.findUnique({ where: { id } }).catch(() => null);
  if (existing) {
    return prisma.workoutWarningSignal.update({ where: { id }, data: { ...input, status: 'OPEN' } });
  }
  return prisma.workoutWarningSignal.create({ data: { id, ...input } });
}

export async function generateAdaptiveWorkoutWarningsForClient(input: { coachUserId?: string; clientUserId: string; metricDate?: string }) {
  const metricDate = dayStart(input.metricDate);
  const metrics = await prisma.dailyRecoveryMetric.findMany({ where: { userId: input.clientUserId, metricDate: metricDate }, orderBy: { updatedAt: 'desc' } });
  const latest = metrics[0];
  if (!latest) return [];
  const warnings = [] as any[];

  if (latest.sleepMinutes != null && latest.sleepMinutes < 300) {
    warnings.push(await upsertWarning({ coachUserId: input.coachUserId, clientUserId: input.clientUserId, warningType: 'LOW_SLEEP', severity: 'HIGH', title: 'Low sleep before training', body: 'Client sleep is under 5 hours. Consider reducing intensity or checking recovery context.', metricDate, evidenceJson: { sleepMinutes: latest.sleepMinutes } }));
  }

  if (latest.readinessScore != null && latest.readinessScore < 45) {
    warnings.push(await upsertWarning({ coachUserId: input.coachUserId, clientUserId: input.clientUserId, warningType: 'LOW_READINESS', severity: 'HIGH', title: 'Low readiness signal', body: 'Readiness score is low. Consider a recovery-focused session or lower load.', metricDate, evidenceJson: { readinessScore: latest.readinessScore } }));
  }

  if (latest.restingHeartRate != null && latest.restingHeartRate > 85) {
    warnings.push(await upsertWarning({ coachUserId: input.coachUserId, clientUserId: input.clientUserId, warningType: 'HIGH_RESTING_HR', severity: 'MEDIUM', title: 'Elevated resting heart rate', body: 'Resting heart rate is elevated. Consider checking stress, sleep, soreness, or illness context.', metricDate, evidenceJson: { restingHeartRate: latest.restingHeartRate } }));
  }

  if (latest.recoveryStatus === 'LOW') {
    warnings.push(await upsertWarning({ coachUserId: input.coachUserId, clientUserId: input.clientUserId, warningType: 'LOW_RECOVERY', severity: 'HIGH', title: 'Low recovery status', body: 'Recovery status is low. Coach may want to adapt workout intensity.', metricDate, evidenceJson: { recoveryStatus: latest.recoveryStatus } }));
  }

  return warnings;
}

export async function generateCoachAdaptiveWorkoutWarnings(actor: Actor) {
  requireCoach(actor);
  const clientIds = await listCoachClientIds(actor.userId);
  const all = [];
  for (const clientUserId of clientIds) {
    all.push(...await generateAdaptiveWorkoutWarningsForClient({ coachUserId: actor.userId, clientUserId }));
  }
  return all;
}

export async function listWorkoutWarnings(actor: Actor, clientUserId?: string) {
  const where = actor.role === 'client'
    ? { clientUserId: actor.userId, status: 'OPEN' }
    : { coachUserId: actor.userId, clientUserId, status: 'OPEN' };
  return prisma.workoutWarningSignal.findMany({ where, orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }] });
}

export async function resolveWorkoutWarning(actor: Actor, warningId: string) {
  const where = actor.role === 'client' ? { id: warningId, clientUserId: actor.userId } : { id: warningId, coachUserId: actor.userId };
  return prisma.workoutWarningSignal.updateMany({ where, data: { status: 'RESOLVED', resolvedAt: new Date() } });
}
