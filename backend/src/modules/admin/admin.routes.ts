
import {Router} from 'express'; import {prisma} from '../../lib/prisma'; import {requireAuth,AuthenticatedRequest,requireRole} from '../../common/middleware/auth'; import {asyncHandler} from '../../common/utils/async-handler';
export const adminRouter=Router(); adminRouter.use(requireAuth,requireRole(['super_admin']));
adminRouter.get('/dashboard',asyncHandler(async(_req,res)=>res.json({users:await prisma.user.count(),programs:await prisma.program.count(),openReports:await prisma.contentReport.count({where:{status:'OPEN'}})})));
adminRouter.get('/users',asyncHandler(async(_req,res)=>res.json({items:await prisma.user.findMany({take:100})})));
adminRouter.patch('/users/:userId/status',asyncHandler(async(req:AuthenticatedRequest,res)=>{const user=await prisma.user.update({where:{id:req.params.userId},data:{status:req.body.status}}); await prisma.adminAuditLog.create({data:{actorUserId:req.user!.sub,actionType:'USER_STATUS_UPDATED',targetType:'USER',targetId:user.id,metadataJson:{status:req.body.status}}}); res.json(user);}));
adminRouter.get('/reports',asyncHandler(async(_req,res)=>res.json({items:await prisma.contentReport.findMany({where:{status:{in:['OPEN','ESCALATED']}}})})));
adminRouter.post('/feature-flags',asyncHandler(async(req,res)=>res.status(201).json(await prisma.featureFlag.upsert({where:{key:req.body.key},update:req.body,create:req.body}))));
adminRouter.get('/audit-logs',asyncHandler(async(_req,res)=>res.json({items:await prisma.adminAuditLog.findMany({take:100,orderBy:{createdAt:'desc'}})})));
