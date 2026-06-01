import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth, AuthenticatedRequest } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/async-handler';

export const onboardingRouter = Router();

const GOAL_MUSCLE_MAP: Record<string, string[][]> = {
  fat_loss: [
    ['chest', 'back', 'shoulders', 'legs', 'core'],
    ['chest', 'back', 'legs', 'core', 'biceps'],
    ['shoulders', 'legs', 'back', 'core', 'triceps'],
  ],
  muscle_gain: [
    ['chest', 'triceps', 'shoulders'],
    ['back', 'biceps'],
    ['legs', 'glutes', 'core'],
    ['chest', 'shoulders', 'triceps'],
    ['back', 'biceps', 'core'],
    ['legs', 'glutes'],
  ],
  strength: [
    ['chest', 'shoulders', 'triceps'],
    ['legs', 'glutes', 'core'],
    ['back', 'biceps', 'shoulders'],
    ['chest', 'legs', 'back'],
  ],
  endurance: [
    ['chest', 'back', 'legs', 'core'],
    ['shoulders', 'legs', 'core', 'biceps'],
    ['chest', 'back', 'legs', 'core'],
  ],
  hybrid: [
    ['chest', 'triceps', 'shoulders'],
    ['back', 'biceps', 'core'],
    ['legs', 'glutes', 'core'],
    ['chest', 'shoulders', 'back'],
    ['legs', 'core'],
  ],
};

const VOLUME_PRESETS: Record<string, { sets: number; reps: string; rest: number; rpe: number; tempo: string }> = {
  fat_loss: { sets: 3, reps: '12-15', rest: 45, rpe: 7, tempo: '2-0-1-0' },
  muscle_gain: { sets: 4, reps: '8-12', rest: 75, rpe: 7, tempo: '3-0-1-1' },
  strength: { sets: 5, reps: '3-6', rest: 150, rpe: 8, tempo: '2-0-1-0' },
  endurance: { sets: 3, reps: '15-20', rest: 30, rpe: 6, tempo: '2-0-1-0' },
  hybrid: { sets: 3, reps: '10-12', rest: 60, rpe: 7, tempo: '2-0-1-0' },
};

const LEVEL_MULT: Record<string, { vol: number; int: number }> = {
  beginner: { vol: 0.8, int: 0.9 },
  intermediate: { vol: 1.0, int: 1.0 },
  advanced: { vol: 1.2, int: 1.1 },
};

const EQUIP_KEYWORDS: Record<string, string[]> = {
  full_gym: [],
  home: ['dumbbell', 'barbell', 'resistance', 'band', 'kettlebell', 'bodyweight'],
  bodyweight: ['bodyweight'],
};

function getSplit(days: number): { name: string; focus: string; muscleGroups: string[] }[] {
  switch (days) {
    case 3: return [
      { name: 'Full Body A', focus: 'Compound Strength', muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'core'] },
      { name: 'Full Body B', focus: 'Hypertrophy', muscleGroups: ['chest', 'back', 'legs', 'biceps', 'triceps'] },
      { name: 'Full Body C', focus: 'Power & Core', muscleGroups: ['legs', 'chest', 'back', 'shoulders', 'core'] },
    ];
    case 4: return [
      { name: 'Upper Push', focus: 'Chest, Shoulders, Triceps', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Lower Body', focus: 'Quads, Hamstrings, Glutes', muscleGroups: ['legs', 'glutes', 'core'] },
      { name: 'Upper Pull', focus: 'Back, Biceps', muscleGroups: ['back', 'biceps', 'shoulders'] },
      { name: 'Full Body', focus: 'Compound Movements', muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'core'] },
    ];
    case 5: return [
      { name: 'Push', focus: 'Chest, Shoulders, Triceps', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', focus: 'Back, Biceps', muscleGroups: ['back', 'biceps'] },
      { name: 'Legs', focus: 'Quads, Hamstrings, Glutes', muscleGroups: ['legs', 'glutes', 'core'] },
      { name: 'Upper Push', focus: 'Chest, Shoulders, Triceps', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull & Core', focus: 'Back, Biceps, Core', muscleGroups: ['back', 'biceps', 'core'] },
    ];
    case 6: return [
      { name: 'Push', focus: 'Chest, Shoulders, Triceps', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', focus: 'Back, Biceps', muscleGroups: ['back', 'biceps'] },
      { name: 'Legs', focus: 'Quads, Hamstrings, Glutes', muscleGroups: ['legs', 'glutes', 'core'] },
      { name: 'Push', focus: 'Chest, Shoulders, Triceps', muscleGroups: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull', focus: 'Back, Biceps', muscleGroups: ['back', 'biceps'] },
      { name: 'Legs & Core', focus: 'Legs, Glutes, Core', muscleGroups: ['legs', 'glutes', 'core'] },
    ];
    default: return getSplit(4);
  }
}

function scoreExercise(ex: { muscleGroups?: string | null; equipment?: string | null }, targetMuscles: string[], equipFilter: string[]): number {
  const groups = (ex.muscleGroups || '').toLowerCase().split(',').map((s: string) => s.trim());
  let score = 0;
  for (const g of groups) {
    if (targetMuscles.some(t => g.includes(t) || t.includes(g))) score += 10;
  }
  if (equipFilter.length === 0) return score;
  const eq = (ex.equipment || '').toLowerCase();
  for (const k of equipFilter) {
    if (eq.includes(k)) score += 1;
  }
  return score;
}

function computeLevelConfidence(answers: { pushups?: number; plankSeconds?: number; squats?: number; daysPerWeekLastMonth?: number }): number {
  let score = 0.5;
  if (answers.pushups != null) {
    if (answers.pushups >= 30) score += 0.15;
    else if (answers.pushups >= 15) score += 0.05;
    else score -= 0.1;
  }
  if (answers.plankSeconds != null) {
    if (answers.plankSeconds >= 120) score += 0.15;
    else if (answers.plankSeconds >= 60) score += 0.05;
    else score -= 0.1;
  }
  if (answers.squats != null) {
    if (answers.squats >= 25) score += 0.1;
    else if (answers.squats >= 15) score += 0.05;
    else score -= 0.05;
  }
  if (answers.daysPerWeekLastMonth != null) {
    if (answers.daysPerWeekLastMonth >= 4) score += 0.1;
    else if (answers.daysPerWeekLastMonth >= 2) score += 0.05;
  }
  return Math.max(0.1, Math.min(1.0, Math.round(score * 100) / 100));
}

function getTrainingStyle(goal: string): string {
  const map: Record<string, string> = {
    fat_loss: 'metabolic',
    muscle_gain: 'hypertrophy',
    strength: 'powerlifting',
    endurance: 'endurance',
    hybrid: 'athletic',
  };
  return map[goal] || 'hypertrophy';
}

function getPeriodization(goal: string): string {
  const map: Record<string, string> = {
    fat_loss: '4-week accumulation with metabolic peaks',
    muscle_gain: '4-week accumulation → intensification → deload',
    strength: '4-week volume → intensity → peak → deload',
    endurance: '4-week base → build → peak → recovery',
    hybrid: '4-week strength → power → conditioning → deload',
  };
  return map[goal] || '4-week progressive periodization';
}

function getEstimatedTimeline(goal: string, level: string): string {
  const base: Record<string, number> = {
    fat_loss: 12,
    muscle_gain: 16,
    strength: 20,
    endurance: 14,
    hybrid: 16,
  };
  const levelMult: Record<string, number> = {
    beginner: 1.2,
    intermediate: 1.0,
    advanced: 0.8,
  };
  const weeks = Math.round((base[goal] || 16) * (levelMult[level] || 1));
  return `${weeks}-${weeks + 4} weeks to visible progress`;
}

onboardingRouter.post('/assessment', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { goal, level, equipment, daysPerWeek, limitations } = req.body;
  res.json({ goal, level, equipment, daysPerWeek, limitations });
}));

onboardingRouter.post('/blueprint', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.sub;
  const {
    goal, level, equipment, daysPerWeek, sessionLength,
    limitations, sleepHours, stressLevel, activityLevel,
    pushups, plankSeconds, squats,
  } = req.body;

  const levelConfidence = computeLevelConfidence({ pushups, plankSeconds, squats, daysPerWeekLastMonth: daysPerWeek });
  const trainingStyle = getTrainingStyle(goal);
  const split = getSplit(daysPerWeek || 4);
  const periodization = getPeriodization(goal);
  const estimatedTimeline = getEstimatedTimeline(goal, level);

  const injuryExclusions = (limitations || []).filter((l: string) => l !== 'None');
  const volumePreset = VOLUME_PRESETS[goal] || VOLUME_PRESETS.muscle_gain;
  const levelMult = LEVEL_MULT[level] || LEVEL_MULT.intermediate;

  const weeklyVolume: Record<string, number> = {};
  for (const day of split) {
    for (const muscle of day.muscleGroups) {
      weeklyVolume[muscle] = (weeklyVolume[muscle] || 0) + Math.round(volumePreset.sets * levelMult.vol);
    }
  }

  const recoveryProfile = {
    sleepHours: sleepHours || 7,
    stressLevel: stressLevel || 3,
    activityLevel: activityLevel || 'moderate',
    recommendation: (sleepHours || 7) < 6
      ? 'Prioritize sleep hygiene — aim for 7+ hours'
      : (stressLevel || 3) >= 4
        ? 'Manage stress with mobility work and rest days'
        : 'Recovery profile looks solid — maintain consistency',
  };

  const blueprint = await prisma.fitnessBlueprint.upsert({
    where: { userId },
    update: {
      goal, trainingStyle, level, levelConfidence, equipment,
      daysPerWeek: daysPerWeek || 4,
      sessionLength: sessionLength || 60,
      split: split.map(d => d.name).join(' / '),
      injuryExclusions, weeklyVolume, periodization,
      recoveryProfile, estimatedTimeline,
    },
    create: {
      userId, goal, trainingStyle, level, levelConfidence, equipment,
      daysPerWeek: daysPerWeek || 4,
      sessionLength: sessionLength || 60,
      split: split.map(d => d.name).join(' / '),
      injuryExclusions, weeklyVolume, periodization,
      recoveryProfile, estimatedTimeline,
    },
  });

  res.json({
    blueprint,
    split,
    recoveryProfile,
    estimatedTimeline,
  });
}));

onboardingRouter.post('/generate-plan', requireAuth, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.sub;
  const { goal, level, equipment, daysPerWeek, limitations } = req.body;

  const allExercises = await prisma.exercise.findMany({ take: 200 });
  if (allExercises.length === 0) {
    res.status(400).json({ error: 'No exercises in library yet. Create exercises first.' });
    return;
  }

  const split = getSplit(daysPerWeek || 4);
  const volPreset = VOLUME_PRESETS[goal] || VOLUME_PRESETS.muscle_gain;
  const levelMult = LEVEL_MULT[level] || LEVEL_MULT.intermediate;
  const equipFilter = EQUIP_KEYWORDS[equipment] || [];

  const program = await prisma.program.create({
    data: {
      coachUserId: userId,
      name: `${goal.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} Program`,
      description: `AI-generated 4-week ${goal.replace(/_/g, ' ')} program for ${level} level. ${daysPerWeek} days/week.`,
    },
  });

  const weeks: Array<{ id: string; weekIndex: number; phaseLabel: string; workouts: Array<{ id: string; title: string; description: string; exercises: { id: string }[] }> }> = [];
  for (let w = 1; w <= 4; w++) {
    const phaseLabel = w <= 2 ? 'Accumulation' : w === 3 ? 'Intensification' : 'Deload';
    const weekVolMult = w === 4 ? 0.6 : w === 3 ? 1.15 : 1.0;

    const week = await prisma.programWeek.create({
      data: {
        programId: program.id,
        weekIndex: w,
        phaseLabel,
        focus: phaseLabel,
      },
    });

    const weekWorkouts: Array<{ id: string; title: string; description: string; exercises: { id: string }[] }> = [];
    for (let d = 0; d < split.length; d++) {
      const day = split[d];
      const targetMuscles = day.muscleGroups;

      const scored = allExercises.map((ex) => ({
        ex,
        score: scoreExercise(ex, targetMuscles, equipFilter),
      }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

      const selected = scored.slice(0, 5).map(s => s.ex);

      const workout = await prisma.workout.create({
        data: {
          coachUserId: userId,
          programId: program.id,
          weekId: week.id,
          dayIndex: d,
          title: day.name,
          description: day.focus,
        },
      });

      const exercises: { id: string }[] = [];
      for (let i = 0; i < selected.length; i++) {
        const ex = selected[i];
        const sets = Math.max(2, Math.round(volPreset.sets * levelMult.vol * weekVolMult));
        const rest = volPreset.rest;

        const we = await prisma.workoutExercise.create({
          data: {
            workoutId: workout.id,
            exerciseId: ex.id,
            orderIndex: i,
            prescribedSets: sets,
            prescribedReps: volPreset.reps,
            prescribedRestSeconds: rest,
            prescribedRpe: Math.min(10, Math.round(volPreset.rpe * levelMult.int)),
            tempo: volPreset.tempo,
          },
        });
        exercises.push(we);
      }
      weekWorkouts.push({ id: workout.id, title: workout.title, description: workout.description || day.focus, exercises });
    }
    weeks.push({ id: week.id, weekIndex: week.weekIndex, phaseLabel: week.phaseLabel || phaseLabel, workouts: weekWorkouts });
  }

  // Auto-assign week 1 workouts to the client
  const today = new Date();
  const week1 = weeks[0];
  if (week1) {
    for (let i = 0; i < week1.workouts.length; i++) {
      const w = week1.workouts[i];
      const assignDate = new Date(today);
      assignDate.setDate(today.getDate() + i);
      await prisma.workoutAssignment.create({
        data: {
          workoutId: w.id,
          clientUserId: userId,
          assignedByUserId: userId,
          assignedForDate: assignDate,
          status: 'assigned',
        },
      });
    }
  }

  // Create program membership
  await prisma.programMembership.create({
    data: { programId: program.id, clientUserId: userId, addedByUserId: userId, status: 'active' },
  });

  // Set as primary program
  await prisma.clientPrimaryProgram.upsert({
    where: { clientUserId: userId },
    update: { programId: program.id, setByUserId: userId },
    create: { clientUserId: userId, programId: program.id, setByUserId: userId },
  });

  res.json({
    program: { ...program, weeks },
    summary: {
      goal,
      level,
      equipment,
      daysPerWeek,
      totalWorkouts: weeks.reduce((sum, w) => sum + w.workouts.length, 0),
      phase: '4-week progressive program',
    },
  });
}));
