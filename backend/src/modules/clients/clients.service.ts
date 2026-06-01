import { prisma } from "../../lib/prisma";
import { HttpError } from "../../common/errors/http-error";
import { calculateMomentumScore } from "./momentum.service";
import { detectPlateaus, getOvertrainingRisk } from "./plateau-detector.service";
import { predictChurnRisk } from "./churn-predictor.service";
import { generateSmartActions } from "./action-engine.service";

type Actor = { userId: string; role: string };

function requireCoach(actor: Actor) {
  if (!["coach", "assistant_coach", "super_admin"].includes(actor.role)) {
    throw new HttpError(403, "Coach access required");
  }
}

async function verifyCoachOwnsClient(coachUserId: string, clientUserId: string) {
  const thread = await prisma.thread.findFirst({
    where: { coachUserId, clientUserId },
  });
  if (!thread) throw new HttpError(403, "Not your client");
  return thread;
}

export async function getClientDossier(actor: Actor, clientUserId: string) {
  requireCoach(actor);
  await verifyCoachOwnsClient(actor.userId, clientUserId);

  const [user, healthScore, riskFlags, assignments, sessions, metrics, notes, programMemberships] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: clientUserId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          clientProfile: true,
        },
      }),
      prisma.clientHealthScoreSnapshot.findFirst({
        where: { coachUserId: actor.userId, clientUserId },
        orderBy: { snapshotDate: "desc" },
      }),
      prisma.clientRiskFlag.findMany({
        where: {
          coachUserId: actor.userId,
          clientUserId,
          status: "OPEN",
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.workoutAssignment.findMany({
        where: { clientUserId, assignedByUserId: actor.userId },
        include: {
          workout: {
            select: { id: true, title: true, description: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.workoutSession.findMany({
        where: { clientUserId },
        include: {
          assignment: {
            select: {
              id: true,
              workout: { select: { id: true, title: true } },
            },
          },
          sets: true,
        },
        orderBy: { startedAt: "desc" },
        take: 20,
      }),
      prisma.metricEntry.findMany({
        where: { clientUserId },
        orderBy: { recordedAt: "desc" },
        take: 50,
      }),
      prisma.coachClientNote.findMany({
        where: { coachUserId: actor.userId, clientUserId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.programMembership.findMany({
        where: { clientUserId },
        include: {
          program: {
            select: { id: true, name: true, description: true, coachUserId: true },
          },
        },
      }),
    ]);

  if (!user) throw new HttpError(404, "Client not found");

  // Calculate intelligence in parallel
  const [momentum, plateaus, overtraining, churnRisk, smartActions] = await Promise.all([
    calculateMomentumScore({ coachUserId: actor.userId, clientUserId }).catch(() => null),
    detectPlateaus(clientUserId).catch(() => []),
    getOvertrainingRisk(clientUserId).catch(() => ({ risk: "LOW" as const, reason: "Insufficient data", sessionsThisWeek: 0, avgReadiness: 50, avgRPE: 7 })),
    predictChurnRisk(actor.userId, clientUserId).catch(() => ({ level: "LOW" as const, score: 0, factors: [] })),
    generateSmartActions(actor.userId, clientUserId).catch(() => []),
  ]);

  return {
    user,
    clientProfile: user.clientProfile,
    healthScore: healthScore
      ? {
          score: healthScore.score,
          healthStatus: healthScore.healthStatus,
          adherenceScore: healthScore.adherenceScore,
          progressScore: healthScore.progressScore,
          engagementScore: healthScore.engagementScore,
          paymentScore: healthScore.paymentScore,
        }
      : null,
    momentum: momentum
      ? {
          score: momentum.score,
          trend: momentum.trend,
          performanceScore: momentum.performanceScore,
          behaviorScore: momentum.behaviorScore,
          engagementScore: momentum.engagementScore,
          recoveryScore: momentum.recoveryScore,
        }
      : null,
    plateaus,
    overtraining,
    churnRisk,
    smartActions,
    riskFlags,
    assignments,
    sessions,
    metrics,
    notes,
    programMemberships,
  };
}

export async function getPendingInvites(actor: Actor) {
  requireCoach(actor);

  const invites = await prisma.coachInvite.findMany({
    where: {
      coachUserId: actor.userId,
      status: "ACCEPTED",
    },
    orderBy: { acceptedAt: "desc" },
  });

  return invites;
}

export async function approveInvite(actor: Actor, inviteId: string) {
  requireCoach(actor);

  const invite = await prisma.coachInvite.findFirst({
    where: {
      id: inviteId,
      coachUserId: actor.userId,
      status: "ACCEPTED",
    },
  });

  if (!invite) throw new HttpError(404, "Pending invite not found");

  // Find or create the user by email
  const user = await prisma.user.findUnique({
    where: { email: invite.email.toLowerCase() },
  });

  if (!user) throw new HttpError(404, "User not found — invite may not have been accepted yet");

  // Atomic: thread + invite status + program membership
  await prisma.$transaction(async (tx) => {
    await tx.thread.upsert({
      where: {
        coachUserId_clientUserId: {
          coachUserId: actor.userId,
          clientUserId: user.id,
        },
      },
      update: {},
      create: {
        coachUserId: actor.userId,
        clientUserId: user.id,
      },
    });

    await tx.coachInvite.update({
      where: { id: inviteId },
      data: { status: "APPROVED" },
    });

    if (invite.programId) {
      await tx.programMembership.upsert({
        where: {
          programId_clientUserId: {
            programId: invite.programId,
            clientUserId: user.id,
          },
        },
        update: {},
        create: {
          programId: invite.programId,
          clientUserId: user.id,
          addedByUserId: actor.userId,
        },
      });
    }
  });

  return { success: true };
}

export async function declineInvite(actor: Actor, inviteId: string) {
  requireCoach(actor);

  const invite = await prisma.coachInvite.findFirst({
    where: {
      id: inviteId,
      coachUserId: actor.userId,
      status: "ACCEPTED",
    },
  });

  if (!invite) throw new HttpError(404, "Pending invite not found");

  await prisma.coachInvite.update({
    where: { id: inviteId },
    data: { status: "DECLINED" },
  });

  return { success: true };
}

export async function cancelInvite(actor: Actor, inviteId: string) {
  requireCoach(actor);

  const invite = await prisma.coachInvite.findFirst({
    where: {
      id: inviteId,
      coachUserId: actor.userId,
    },
  });

  if (!invite) throw new HttpError(404, "Invite not found");
  if (invite.status === "APPROVED") throw new HttpError(400, "Cannot cancel an approved invite");

  await prisma.coachInvite.update({
    where: { id: inviteId },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}

export async function getNotes(actor: Actor, clientUserId: string) {
  requireCoach(actor);
  await verifyCoachOwnsClient(actor.userId, clientUserId);

  const notes = await prisma.coachClientNote.findMany({
    where: { coachUserId: actor.userId, clientUserId },
    orderBy: { createdAt: "desc" },
  });

  return notes;
}

export async function addNote(actor: Actor, clientUserId: string, content: string) {
  requireCoach(actor);
  await verifyCoachOwnsClient(actor.userId, clientUserId);

  const note = await prisma.coachClientNote.create({
    data: {
      coachUserId: actor.userId,
      clientUserId,
      content,
    },
  });

  return note;
}

export async function deleteNote(actor: Actor, noteId: string) {
  requireCoach(actor);

  const note = await prisma.coachClientNote.findFirst({
    where: { id: noteId, coachUserId: actor.userId },
  });

  if (!note) throw new HttpError(404, "Note not found");

  await prisma.coachClientNote.delete({ where: { id: noteId } });

  return { success: true };
}
