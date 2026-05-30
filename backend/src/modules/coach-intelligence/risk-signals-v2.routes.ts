import { Router } from 'express';
import { asyncHandler } from '../../common/utils/async-handler';
import { requireAuth, type AuthenticatedRequest } from '../../common/middleware/auth';
import { detectLowAdherence, detectStalledProgress, detectPaymentAccessRisk, runFullRiskSignalScan } from './risk-signal-detectors.service';

export const riskSignalsV2Router = Router();

riskSignalsV2Router.post('/scan/full', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await runFullRiskSignalScan({ userId: req.user!.sub, role: req.user!.role }));
}));

riskSignalsV2Router.post('/scan/low-adherence', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await detectLowAdherence({ userId: req.user!.sub, role: req.user!.role }));
}));

riskSignalsV2Router.post('/scan/stalled-progress', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await detectStalledProgress({ userId: req.user!.sub, role: req.user!.role }));
}));

riskSignalsV2Router.post('/scan/payment-risk', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  res.json(await detectPaymentAccessRisk({ userId: req.user!.sub, role: req.user!.role }));
}));
