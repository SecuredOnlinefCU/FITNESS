'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Dumbbell, Zap, Clock, BarChart3 } from 'lucide-react';
import { WorkoutSession } from '@/lib/types/domain';

function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Less than a minute';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

interface CelebrationProps {
  session: WorkoutSession;
}

export function PostSessionCelebration({ session }: CelebrationProps) {
  const router = useRouter();

  const sets = session.sets ?? [];
  const totalVolume = sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
  const totalReps = sets.reduce((sum, s) => sum + (s.reps || 0), 0);
  const exercisesDone = new Set(sets.map(s => s.workoutExerciseId)).size;
  const totalExercises = session.assignment?.workout?.exercises?.length ?? 0;

  const rpeSets = sets.filter(s => s.rpe != null);
  const avgRpe = rpeSets.length > 0
    ? Math.round(rpeSets.reduce((sum, s) => sum + (s.rpe || 0), 0) / rpeSets.length * 10) / 10
    : null;

  const durationMinutes = (() => {
    if (!session.startedAt) return null;
    const end = session.completedAt ? new Date(session.completedAt) : new Date();
    const start = new Date(session.startedAt);
    return (end.getTime() - start.getTime()) / 60000;
  })();

  const stats = [
    { icon: Dumbbell, label: 'Exercises', value: `${exercisesDone} of ${totalExercises}`, color: 'text-primary' },
    { icon: BarChart3, label: 'Total volume', value: `${totalVolume.toLocaleString()} kg`, color: 'text-flow' },
    { icon: Zap, label: 'Total reps', value: totalReps.toLocaleString(), color: 'text-energy' },
    ...(avgRpe ? [{ icon: Zap, label: 'Avg RPE', value: avgRpe.toFixed(1), color: avgRpe >= 8 ? 'text-pulse' : avgRpe >= 6 ? 'text-energy' : 'text-flow' }] : []),
    ...(durationMinutes ? [{ icon: Clock, label: 'Duration', value: formatDuration(durationMinutes), color: 'text-muted-foreground' }] : []),
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <CheckCircle className="h-20 w-20 text-primary" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-3xl font-black"
      >
        Workout complete!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-muted-foreground"
      >
        {session.assignment?.workout?.title || 'Great effort'} &mdash; here&apos;s how it went.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid w-full max-w-md grid-cols-2 gap-3"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="rounded-2xl bg-muted p-4"
          >
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <p className="mt-2 text-2xl font-black">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {sets.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          No sets were logged this session. Every workout starts somewhere!
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-10"
      >
        <button
          onClick={() => router.push('/client/workouts')}
          className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
        >
          Back to workouts
        </button>
      </motion.div>
    </div>
  );
}
