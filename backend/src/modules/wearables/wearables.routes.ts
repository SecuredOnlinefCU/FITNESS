import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { listWearableConnections, upsertWearableConnection, disconnectWearable } from './wearables.service';

export const wearablesRouter = Router();

wearablesRouter.get('/connections', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json({ items: await listWearableConnections({ userId: req.user!.sub, role: req.user!.role }) });
}));

wearablesRouter.post('/connections', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const body = z.object({ provider: z.string(), status: z.string().optional(), externalAccountId: z.string().optional(), scopesJson: z.any().optional(), metadataJson: z.any().optional() }).parse(req.body);
  res.json(await upsertWearableConnection({ userId: req.user!.sub, role: req.user!.role }, body));
}));

wearablesRouter.post('/connections/:provider/disconnect', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await disconnectWearable({ userId: req.user!.sub, role: req.user!.role }, req.params.provider));
}));
