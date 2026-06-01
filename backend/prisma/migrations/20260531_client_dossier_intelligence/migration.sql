-- AlterTable: Extend ClientProfile with dossier fields
ALTER TABLE "ClientProfile" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "ClientProfile" ADD COLUMN "gender" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "heightCm" DOUBLE PRECISION;
ALTER TABLE "ClientProfile" ADD COLUMN "startingWeight" DOUBLE PRECISION;
ALTER TABLE "ClientProfile" ADD COLUMN "currentGoal" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "goalTimeline" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "currentPhase" TEXT NOT NULL DEFAULT 'ONBOARDING';
ALTER TABLE "ClientProfile" ADD COLUMN "communicationStyle" TEXT;
ALTER TABLE "ClientProfile" ADD COLUMN "disciplineLevel" TEXT;

-- CreateTable: ClientGoal
CREATE TABLE "ClientGoal" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "goalType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "targetUnit" TEXT,
    "currentValue" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MomentumScore
CREATE TABLE "MomentumScore" (
    "id" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "coachUserId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 50,
    "trend" TEXT NOT NULL DEFAULT 'STABLE',
    "performanceScore" INTEGER NOT NULL DEFAULT 50,
    "behaviorScore" INTEGER NOT NULL DEFAULT 50,
    "engagementScore" INTEGER NOT NULL DEFAULT 50,
    "recoveryScore" INTEGER NOT NULL DEFAULT 50,
    "evidenceJson" JSONB NOT NULL DEFAULT '{}',
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MomentumScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientGoal_clientUserId_status_idx" ON "ClientGoal"("clientUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MomentumScore_clientUserId_coachUserId_snapshotDate_key" ON "MomentumScore"("clientUserId", "coachUserId", "snapshotDate");
CREATE INDEX "MomentumScore_coachUserId_snapshotDate_idx" ON "MomentumScore"("coachUserId", "snapshotDate");
CREATE INDEX "MomentumScore_clientUserId_snapshotDate_idx" ON "MomentumScore"("clientUserId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "ClientGoal" ADD CONSTRAINT "ClientGoal_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MomentumScore" ADD CONSTRAINT "MomentumScore_clientUserId_fkey" FOREIGN KEY ("clientUserId") REFERENCES "ClientProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
