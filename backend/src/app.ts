
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./modules/auth/auth.routes";
import { programsRouter } from "./modules/programs/programs.routes";
import { feedRouter } from "./modules/feed/feed.routes";
import { moderationRouter } from "./modules/feed/moderation.routes";
import { messagingRouter } from "./modules/messaging/messaging.routes";
import { trainingRouter } from "./modules/training/training.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { progressRouter } from "./modules/progress/progress.routes";
import { nutritionRouter } from "./modules/nutrition/nutrition.routes";
import { paymentsRouter, stripeWebhookRouter } from "./modules/payments/payments.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { integrationsRouter } from "./modules/integrations/integrations.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { coachIntelligenceRouter } from "./modules/coach-intelligence/coach-intelligence.routes";
import { checkinsRouter } from "./modules/checkins/checkins.routes";
import { riskSignalsV2Router } from "./modules/coach-intelligence/risk-signals-v2.routes";
import { clientHealthRouter } from "./modules/coach-intelligence/client-health.routes";
import { wearablesRouter } from "./modules/wearables/wearables.routes";
import { recoveryRouter } from "./modules/recovery/recovery.routes";
import { workoutWarningsRouter } from "./modules/coach-intelligence/workout-warnings.routes";
import { todayIntelligenceRouter } from "./modules/intelligence/today-intelligence.routes";
import { habitsRouter } from "./modules/habits/habits.routes";
import { mediaRouter } from "./modules/media/media.routes";
import { clientsRouter } from "./modules/clients/clients.routes";
import { onboardingRouter } from "./modules/onboarding/onboarding.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { notFoundHandler } from "./common/middleware/not-found";
import { errorHandler } from "./common/middleware/error-handler";
import { rateLimit } from "./common/middleware/rate-limit";

export function createApp(){
 const app=express();
 app.use(helmet()); app.use(cors()); app.use(morgan('dev')); app.use(rateLimit({windowMs:60000,max:240}));
 app.use('/api/payments/webhooks/stripe', express.raw({type:'application/json'}), stripeWebhookRouter);
 app.use(express.json({limit:'50mb'}));
 app.get('/health',(_req,res)=>res.json({status:'ok',service:'unified-fitness-backend-v1'}));
 app.use('/api/auth',authRouter); app.use('/api/programs',programsRouter); app.use('/api/feed',feedRouter); app.use('/api/moderation',moderationRouter);
 app.use('/api/messaging',messagingRouter); app.use('/api/training',trainingRouter); app.use('/api/tasks',tasksRouter); app.use('/api/progress',progressRouter);
 app.use('/api/nutrition',nutritionRouter); app.use('/api/payments',paymentsRouter); app.use('/api/notifications',notificationsRouter); app.use('/api/integrations',integrationsRouter); app.use('/api/admin',adminRouter);
 app.use('/api/analytics',analyticsRouter); app.use('/api/coach-intelligence',coachIntelligenceRouter); app.use('/api/checkins',checkinsRouter); app.use('/api/coach-intelligence/risk-signals-v2',riskSignalsV2Router);
 app.use('/api/coach-intelligence/client-health',clientHealthRouter); app.use('/api/wearables',wearablesRouter); app.use('/api/recovery',recoveryRouter);
 app.use('/api/coach-intelligence/workout-warnings',workoutWarningsRouter); app.use('/api/intelligence',todayIntelligenceRouter);   app.use('/api/habits',habitsRouter); app.use('/api/media',mediaRouter); app.use('/api/clients',clientsRouter); app.use('/api/onboarding',onboardingRouter);
 app.use(notFoundHandler); app.use(errorHandler); return app;
}
