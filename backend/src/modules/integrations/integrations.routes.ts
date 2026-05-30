
import {Router} from 'express'; import {prisma} from '../../lib/prisma'; import {requireAuth,AuthenticatedRequest} from '../../common/middleware/auth'; import {asyncHandler} from '../../common/utils/async-handler';
export const integrationsRouter=Router(); integrationsRouter.use(requireAuth);
integrationsRouter.get('/providers',asyncHandler(async(_req,res)=>res.json({providers:['APPLE_HEALTH','HEALTH_CONNECT','FITBIT','GARMIN','OURA','MYFITNESSPAL','CRONOMETER']})));
integrationsRouter.get('/accounts',asyncHandler(async(req:AuthenticatedRequest,res)=>res.json({items:await prisma.integrationAccount.findMany({where:{userId:req.user!.sub}})})));
integrationsRouter.post('/connect',asyncHandler(async(req:AuthenticatedRequest,res)=>res.status(201).json(await prisma.integrationAccount.upsert({where:{userId_provider:{userId:req.user!.sub,provider:req.body.provider}},update:{...req.body,status:'CONNECTED'},create:{userId:req.user!.sub,...req.body,status:'CONNECTED'}}))));
integrationsRouter.post('/sync-events',asyncHandler(async(req:AuthenticatedRequest,res)=>res.status(201).json(await prisma.integrationSyncEvent.create({data:{userId:req.user!.sub,...req.body}}))));
