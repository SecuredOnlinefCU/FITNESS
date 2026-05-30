import { prisma } from '../../lib/prisma';

type Actor = { userId: string; role: string };

function dayStart(dateInput?: string | Date) {
  const date = dateInput ? new Date(dateInput) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function computeReadiness(input: { sleepMinutes?: number | null; sleepScore?: number | null; hrvMs?: number | null; restingHeartRate?: number | null; steps?: number | null }) {
  let score = 70;
  if (input.sleepScore != null) score = Math.round((score + input.sleepScore) / 2);
  if (input.sleepMinutes != null) {
    if (input.sleepMinutes < 300) score -= 25;
    else if (input.sleepMinutes < 390) score -= 10;
    else if (input.sleepMinutes >= 420) score += 5;
  }
  if (input.hrvMs != null) {
    if (input.hrvMs < 35) score -= 10;
    if (input.hrvMs > 60) score += 5;
  }
  if (input.restingHeartRate != null && input.restingHeartRate > 85) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function statusFromReadiness(score?: number | null) {
  if (score == null) return 'UNKNOWN';
  if (score < 40) return 'LOW';
  if (score < 60) return 'WATCH';
  if (score < 80) return 'NORMAL';
  return 'OPTIMAL';
}

export async function upsertDailyRecoveryMetric(actor: Actor, input: { metricDate?: string; provider?: string; sleepMinutes?: number; sleepScore?: number; restingHeartRate?: number; hrvMs?: number; steps?: number; caloriesBurned?: number; readinessScore?: number; sourcePayloadJson?: any }) {
  const metricDate = dayStart(input.metricDate);
  const readinessScore = input.readinessScore ?? computeReadiness(input);
  const recoveryStatus = statusFromReadiness(readinessScore);

  return prisma.dailyRecoveryMetric.upsert({
    where: { userId_metricDate_provider: { userId: actor.userId, metricDate, provider: input.provider ?? 'MANUAL' } },
    update: { ...input, metricDate, provider: input.provider ?? 'MANUAL', readinessScore, recoveryStatus, sourcePayloadJson: input.sourcePayloadJson ?? {} },
    create: { userId: actor.userId, metricDate, provider: input.provider ?? 'MANUAL', sleepMinutes: input.sleepMinutes, sleepScore: input.sleepScore, restingHeartRate: input.restingHeartRate, hrvMs: input.hrvMs, steps: input.steps, caloriesBurned: input.caloriesBurned, readinessScore, recoveryStatus, sourcePayloadJson: input.sourcePayloadJson ?? {} },
  });
}

export async function getMyRecoveryToday(actor: Actor) {
  const metricDate = dayStart();
  return prisma.dailyRecoveryMetric.findMany({ where: { userId: actor.userId, metricDate }, orderBy: { updatedAt: 'desc' } });
}

export async function listMyRecoveryHistory(actor: Actor, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  return prisma.dailyRecoveryMetric.findMany({ where: { userId: actor.userId, metricDate: { gte: since } }, orderBy: { metricDate: 'desc' } });
}
