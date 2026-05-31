import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

type DetectionResult = {
  clientsScanned: number;
  flagsCreated: number;
  flagsUpdated: number;
  items: any[];
};

function requireCoach(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) {
    throw new HttpError(403, 'Coach access required');
  }
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000);
}

async function listCoachClientIds(coachUserId: string) {
  const threads = await prisma.thread.findMany({ where: { coachUserId }, select: { clientUserId: true } }).catch(() => []);
  return Array.from(new Set(threads.map((thread) => thread.clientUserId)));
}

async function upsertRiskFlag(input: {
  coachUserId: string;
  clientUserId: string;
  flagType: string;
  severity: string;
  title: string;
  body: string;
  evidenceJson: any;
}) {
  const id = `${input.flagType.toLowerCase()}-${input.coachUserId}-${input.clientUserId}`;
  const existing = await prisma.clientRiskFlag.findUnique({ where: { id } }).catch(() => null);

  if (existing) {
    return {
      mode: 'updated' as const,
      flag: await prisma.clientRiskFlag.update({
        where: { id },
        data: {
          severity: input.severity,
          title: input.title,
          body: input.body,
          status: 'OPEN',
          evidenceJson: input.evidenceJson,
        },
      }),
    };
  }

  return {
    mode: 'created' as const,
    flag: await prisma.clientRiskFlag.create({
      data: { id, ...input },
    }),
  };
}

export async function detectLowAdherence(actor: Actor) {
  requireCoach(actor);
  const coachUserId = actor.userId;
  const clientIds = await listCoachClientIds(coachUserId);
  const items: any[] = [];
  let flagsCreated = 0;
  let flagsUpdated = 0;

  for (const clientUserId of clientIds) {
    const since = daysAgo(7);

    const [habitLogs, taskAssignments] = await Promise.all([
      prisma.habitLog.findMany({ where: { clientUserId, completedAt: { gte: since } } }).catch(() => []),
      prisma.taskAssignment.findMany({ where: { clientUserId } }).catch(() => []),
    ]);

    const assignedTasks = taskAssignments.length;
    const completedTasks = taskAssignments.filter((task: any) => task.status === 'COMPLETED').length;
    const taskAdherence = assignedTasks > 0 ? completedTasks / assignedTasks : 1;
    const habitAdherence = habitLogs.length >= 3 ? 1 : habitLogs.length / 3;
    const adherenceScore = Math.round(((taskAdherence + habitAdherence) / 2) * 100);

    if (adherenceScore >= 60) continue;

    const severity = adherenceScore < 30 ? 'HIGH' : 'MEDIUM';
    const result = await upsertRiskFlag({
      coachUserId,
      clientUserId,
      flagType: 'LOW_ADHERENCE',
      severity,
      title: 'Low adherence detected',
      body: `Client adherence is tracking around ${adherenceScore}% over the recent window.`,
      evidenceJson: { adherenceScore, assignedTasks, completedTasks, habitLogsLast7Days: habitLogs.length },
    });

    result.mode === 'created' ? flagsCreated++ : flagsUpdated++;
    items.push(result.flag);
  }

  await prisma.coachRiskScanRun.create({
    data: { coachUserId, scanType: 'LOW_ADHERENCE', clientsScanned: clientIds.length, flagsCreated, flagsUpdated },
  });

  return { clientsScanned: clientIds.length, flagsCreated, flagsUpdated, items } satisfies DetectionResult;
}

export async function detectStalledProgress(actor: Actor) {
  requireCoach(actor);
  const coachUserId = actor.userId;
  const clientIds = await listCoachClientIds(coachUserId);
  const items: any[] = [];
  let flagsCreated = 0;
  let flagsUpdated = 0;

  for (const clientUserId of clientIds) {
    const since = daysAgo(21);
    const recentMetrics = await prisma.metricEntry.findMany({
      where: { clientUserId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'desc' },
    }).catch(() => []);

    const recentCheckIns = await prisma.checkinSubmission.findMany({
      where: { clientUserId, submittedAt: { gte: since } },
    }).catch(() => []);

    const noMetrics = recentMetrics.length === 0;
    const noCheckIns = recentCheckIns.length === 0;
    if (!noMetrics && !noCheckIns) continue;

    const severity = noMetrics && noCheckIns ? 'HIGH' : 'MEDIUM';
    const result = await upsertRiskFlag({
      coachUserId,
      clientUserId,
      flagType: 'STALLED_PROGRESS',
      severity,
      title: 'Progress may be stalled',
      body: 'Client has limited recent progress updates, metrics, or check-ins.',
      evidenceJson: { daysWindow: 21, metricsCount: recentMetrics.length, checkInsCount: recentCheckIns.length },
    });

    result.mode === 'created' ? flagsCreated++ : flagsUpdated++;
    items.push(result.flag);
  }

  await prisma.coachRiskScanRun.create({
    data: { coachUserId, scanType: 'STALLED_PROGRESS', clientsScanned: clientIds.length, flagsCreated, flagsUpdated },
  });

  return { clientsScanned: clientIds.length, flagsCreated, flagsUpdated, items } satisfies DetectionResult;
}

export async function detectPaymentAccessRisk(actor: Actor) {
  requireCoach(actor);
  const coachUserId = actor.userId;
  const clientIds = await listCoachClientIds(coachUserId);
  const items: any[] = [];
  let flagsCreated = 0;
  let flagsUpdated = 0;

  for (const clientUserId of clientIds) {
    const subscriptions = await prisma.subscription.findMany({
      where: { clientUserId, coachUserId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    }).catch(() => []);

    const subscription = subscriptions[0];
    const riskyStatuses = ['PAST_DUE', 'UNPAID', 'CANCELED', 'INCOMPLETE', 'NONE'];
    const status = subscription?.status ?? 'NONE';
    if (!riskyStatuses.includes(status)) continue;

    const severity = ['PAST_DUE', 'UNPAID'].includes(status) ? 'HIGH' : 'MEDIUM';
    const result = await upsertRiskFlag({
      coachUserId,
      clientUserId,
      flagType: 'PAYMENT_RISK',
      severity,
      title: 'Payment or access risk',
      body: `Client billing/access status is ${status}.`,
      evidenceJson: { status, subscriptionId: subscription?.id },
    });

    result.mode === 'created' ? flagsCreated++ : flagsUpdated++;
    items.push(result.flag);
  }

  await prisma.coachRiskScanRun.create({
    data: { coachUserId, scanType: 'PAYMENT_RISK', clientsScanned: clientIds.length, flagsCreated, flagsUpdated },
  });

  return { clientsScanned: clientIds.length, flagsCreated, flagsUpdated, items } satisfies DetectionResult;
}

export async function runFullRiskSignalScan(actor: Actor) {
  const [lowAdherence, stalledProgress, paymentRisk] = await Promise.all([
    detectLowAdherence(actor),
    detectStalledProgress(actor),
    detectPaymentAccessRisk(actor),
  ]);

  return { lowAdherence, stalledProgress, paymentRisk };
}
