import { prisma } from '../../lib/prisma';
import { HttpError } from '../../common/errors/http-error';

type Actor = { userId: string; role: string };

function requireCoach(actor: Actor) {
  if (!['coach', 'assistant_coach', 'super_admin'].includes(actor.role)) throw new HttpError(403, 'Coach access required');
}

function recommendationForFlag(flag: any) {
  if (flag.flagType === 'MISSED_CHECKIN') return { recommendationType: 'SCHEDULE_CHECKIN', title: 'Schedule a check-in', body: 'Reach out and help the client re-establish their check-in rhythm.', priority: 90, actionHref: `/dashboard/messages` };
  if (flag.flagType === 'LOW_ADHERENCE') return { recommendationType: 'MESSAGE_CLIENT', title: 'Send adherence support message', body: 'Ask what is making consistency hard and offer one simple adjustment.', priority: 85, actionHref: `/dashboard/messages` };
  if (flag.flagType === 'STALLED_PROGRESS') return { recommendationType: 'REVIEW_PROGRESS', title: 'Review progress and plan fit', body: 'Check recent metrics, photos, and workouts to see if the plan needs adjustment.', priority: 80, actionHref: `/coach/progress` };
  if (flag.flagType === 'PAYMENT_RISK') return { recommendationType: 'BILLING_FOLLOWUP', title: 'Review access or billing status', body: 'Confirm whether billing or access is interrupting coaching continuity.', priority: 70, actionHref: `/coach/packages` };
  return { recommendationType: 'MESSAGE_CLIENT', title: 'Check in with client', body: 'Reach out with a supportive message.', priority: 60, actionHref: `/dashboard/messages` };
}

export async function generateCoachActionRecommendations(actor: Actor, clientUserId?: string) {
  requireCoach(actor);
  const flags = await prisma.clientRiskFlag.findMany({ where: { coachUserId: actor.userId, clientUserId, status: 'OPEN' } });
  const created = [];

  await prisma.coachActionRecommendation.updateMany({ where: { coachUserId: actor.userId, clientUserId, status: 'OPEN' }, data: { status: 'DISMISSED', dismissedAt: new Date() } });

  for (const flag of flags) {
    const rec = recommendationForFlag(flag);
    const item = await prisma.coachActionRecommendation.create({
      data: {
        coachUserId: actor.userId,
        clientUserId: flag.clientUserId,
        recommendationType: rec.recommendationType,
        title: rec.title,
        body: rec.body,
        priority: rec.priority,
        actionHref: rec.actionHref,
        evidenceJson: { flagId: flag.id, flagType: flag.flagType, severity: flag.severity },
      },
    });
    await prisma.riskFlagTimelineEvent.create({ data: { coachUserId: actor.userId, clientUserId: flag.clientUserId, riskFlagId: flag.id, eventType: 'ACTION_RECOMMENDED', title: rec.title, body: rec.body, severity: flag.severity, metadataJson: { recommendationId: item.id } } });
    created.push(item);
  }

  return created.sort((a, b) => b.priority - a.priority);
}

export async function completeCoachActionRecommendation(actor: Actor, recommendationId: string) {
  requireCoach(actor);
  return prisma.coachActionRecommendation.updateMany({ where: { id: recommendationId, coachUserId: actor.userId }, data: { status: 'COMPLETED', completedAt: new Date() } });
}
