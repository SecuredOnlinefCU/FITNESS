-- CreateTable
CREATE TABLE "FitnessBlueprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "trainingStyle" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "levelConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "equipment" TEXT NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "sessionLength" INTEGER NOT NULL,
    "split" TEXT NOT NULL,
    "injuryExclusions" JSONB NOT NULL DEFAULT '[]',
    "weeklyVolume" JSONB NOT NULL DEFAULT '{}',
    "periodization" TEXT NOT NULL,
    "recoveryProfile" JSONB NOT NULL DEFAULT '{}',
    "estimatedTimeline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitnessBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "coachUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "splitType" TEXT,
    "exercises" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FitnessBlueprint_userId_key" ON "FitnessBlueprint"("userId");

-- AddForeignKey
ALTER TABLE "FitnessBlueprint" ADD CONSTRAINT "FitnessBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
