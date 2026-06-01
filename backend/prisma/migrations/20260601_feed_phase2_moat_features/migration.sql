-- Create FeedPostType enum
CREATE TYPE "FeedPostType" AS ENUM ('COACH_MESSAGE', 'MILESTONE', 'CHECK_IN_PROMPT', 'RECOVERY_ALERT', 'WORKOUT_ASSIGNED', 'CHALLENGE_UPDATE', 'NUTRITION_HACK', 'PROGRESS_SPOTLIGHT');

-- Add columns to FeedPost
ALTER TABLE "FeedPost" ADD COLUMN "type" "FeedPostType" NOT NULL DEFAULT 'COACH_MESSAGE';
ALTER TABLE "FeedPost" ADD COLUMN "scheduledAt" TIMESTAMP(3);
ALTER TABLE "FeedPost" ADD COLUMN "metaJson" JSONB NOT NULL DEFAULT '{}';

-- Composite indexes for feed queries
CREATE INDEX IF NOT EXISTS "FeedPost_scopeType_scopeId_status_type_idx" ON "FeedPost" ("scopeType", "scopeId", "status", "type");
CREATE INDEX IF NOT EXISTS "FeedPost_authorUserId_type_createdAt_idx" ON "FeedPost" ("authorUserId", "type", "createdAt" DESC);
