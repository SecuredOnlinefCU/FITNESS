-- AlterTable: Add status column to CoachInvite
ALTER TABLE "CoachInvite" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';

-- CreateTable: CoachClientNote
CREATE TABLE "CoachClientNote" (
    "id" TEXT NOT NULL,
    "coachUserId" TEXT NOT NULL,
    "clientUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachClientNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachClientNote_coachUserId_clientUserId_idx" ON "CoachClientNote"("coachUserId", "clientUserId");
