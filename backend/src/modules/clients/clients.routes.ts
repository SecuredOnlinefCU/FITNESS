import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { requireAuth, AuthenticatedRequest, requireRole } from "../../common/middleware/auth";
import { asyncHandler } from "../../common/utils/async-handler";
import {
  getClientDossier,
  getPendingInvites,
  approveInvite,
  declineInvite,
  cancelInvite,
  getNotes,
  addNote,
  deleteNote,
} from "./clients.service";
import { getMomentumHistory } from "./momentum.service";
import { detectPlateaus, getOvertrainingRisk } from "./plateau-detector.service";
import { predictChurnRisk } from "./churn-predictor.service";
import { generateSmartActions } from "./action-engine.service";

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

clientsRouter.get(
  "/pending-invites",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const invites = await getPendingInvites({
      userId: req.user!.sub,
      role: req.user!.role,
    });
    res.json({ items: invites });
  }),
);

clientsRouter.post(
  "/pending-invites/:inviteId/approve",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await approveInvite(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.inviteId,
    );
    res.json(result);
  }),
);

clientsRouter.post(
  "/pending-invites/:inviteId/decline",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await declineInvite(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.inviteId,
    );
    res.json(result);
  }),
);

clientsRouter.delete(
  "/pending-invites/:inviteId",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await cancelInvite(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.inviteId,
    );
    res.json(result);
  }),
);

clientsRouter.get(
  "/:clientUserId",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const dossier = await getClientDossier(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.clientUserId,
    );
    res.json(dossier);
  }),
);

clientsRouter.get(
  "/:clientUserId/notes",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const notes = await getNotes(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.clientUserId,
    );
    res.json({ items: notes });
  }),
);

clientsRouter.post(
  "/:clientUserId/notes",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = z.object({ content: z.string().min(1).max(2000) }).parse(req.body);
    const note = await addNote(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.clientUserId,
      body.content,
    );
    res.status(201).json(note);
  }),
);

clientsRouter.delete(
  "/:clientUserId/notes/:noteId",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await deleteNote(
      { userId: req.user!.sub, role: req.user!.role },
      req.params.noteId,
    );
    res.json(result);
  }),
);

// Intelligence endpoints
clientsRouter.get(
  "/:clientUserId/momentum",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const history = await getMomentumHistory(req.user!.sub, req.params.clientUserId, days);
    res.json({ items: history });
  }),
);

clientsRouter.get(
  "/:clientUserId/plateaus",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const plateaus = await detectPlateaus(req.params.clientUserId);
    res.json({ items: plateaus });
  }),
);

clientsRouter.get(
  "/:clientUserId/overtraining",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const risk = await getOvertrainingRisk(req.params.clientUserId);
    res.json(risk);
  }),
);

clientsRouter.get(
  "/:clientUserId/churn-risk",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const risk = await predictChurnRisk(req.user!.sub, req.params.clientUserId);
    res.json(risk);
  }),
);

clientsRouter.get(
  "/:clientUserId/smart-actions",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const actions = await generateSmartActions(req.user!.sub, req.params.clientUserId);
    res.json({ items: actions });
  }),
);

// Update client profile
clientsRouter.patch(
  "/:clientUserId/profile",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = z
      .object({
        dateOfBirth: z.string().datetime().optional(),
        gender: z.string().optional(),
        heightCm: z.number().optional(),
        startingWeight: z.number().optional(),
        currentGoal: z.string().optional(),
        goalTimeline: z.string().optional(),
        currentPhase: z.string().optional(),
        communicationStyle: z.string().optional(),
        disciplineLevel: z.string().optional(),
      })
      .parse(req.body);

    const profile = await prisma.clientProfile.update({
      where: { userId: req.params.clientUserId },
      data: body,
    });
    res.json(profile);
  }),
);

// Client goals
clientsRouter.get(
  "/:clientUserId/goals",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const goals = await prisma.clientGoal.findMany({
      where: { clientUserId: req.params.clientUserId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items: goals });
  }),
);

clientsRouter.post(
  "/:clientUserId/goals",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const body = z
      .object({
        goalType: z.string().min(1),
        title: z.string().min(1),
        targetValue: z.number().optional(),
        targetUnit: z.string().optional(),
        targetDate: z.string().datetime().optional(),
      })
      .parse(req.body);

    const goal = await prisma.clientGoal.create({
      data: {
        clientUserId: req.params.clientUserId,
        ...body,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
      },
    });
    res.status(201).json(goal);
  }),
);

clientsRouter.delete(
  "/:clientUserId/goals/:goalId",
  requireRole(["coach", "assistant_coach"]),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await prisma.clientGoal.deleteMany({
      where: { id: req.params.goalId, clientUserId: req.params.clientUserId },
    });
    res.json({ success: true });
  }),
);
