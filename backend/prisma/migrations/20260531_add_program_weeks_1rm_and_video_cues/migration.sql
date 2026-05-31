-- ProgramWeek table
CREATE TABLE "ProgramWeek" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "phaseLabel" TEXT,
    "focus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramWeek_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgramWeek_programId_weekIndex_key" ON "ProgramWeek"("programId", "weekIndex");

ALTER TABLE "ProgramWeek" ADD CONSTRAINT "ProgramWeek_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New columns on Workout
ALTER TABLE "Workout" ADD COLUMN "weekId" TEXT;
ALTER TABLE "Workout" ADD COLUMN "dayIndex" INTEGER;
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "ProgramWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New columns on Exercise
ALTER TABLE "Exercise" ADD COLUMN "demoVideoUrl" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "coachCues" TEXT;

-- New columns on WorkoutExercise
ALTER TABLE "WorkoutExercise" ADD COLUMN "prescribedRpe" DOUBLE PRECISION;
ALTER TABLE "WorkoutExercise" ADD COLUMN "supersetGroupId" TEXT;

-- New column on SetLog
ALTER TABLE "SetLog" ADD COLUMN "setType" TEXT NOT NULL DEFAULT 'working';

-- Add missing WorkoutAssignment → Workout FK
ALTER TABLE "WorkoutAssignment" ADD CONSTRAINT "WorkoutAssignment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
