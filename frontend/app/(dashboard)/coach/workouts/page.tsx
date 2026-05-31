'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { trainingApi } from '@/lib/api/modules/training';
import { AssignWorkoutModal } from '@/components/coach/assign-workout-modal';
import { TrainingCalendar } from '@/components/workout/training-calendar';
import { CreateExerciseDialog } from '@/components/exercise/create-exercise-dialog';
import { Dumbbell, Library, ClipboardList, Plus, Trash2, UserPlus, Eye, CalendarDays, List as ListIcon, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { WorkoutAssignment } from '@/lib/types/domain';

export default function CoachWorkoutsPage() {
  const router = useRouter();
  const workouts = useAsyncData(() => trainingApi.listWorkouts(), []);
  const exercises = useAsyncData(() => trainingApi.listExercises(), []);
  const assignments = useAsyncData(() => trainingApi.listAssignments(), []);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignDate, setAssignDate] = useState<string>('');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [showCreateExercise, setShowCreateExercise] = useState(false);

  const data = workouts.data?.items ?? [];
  const exerciseCount = exercises.data?.items?.length ?? 0;
  const assignmentCount = assignments.data?.items?.length ?? 0;
  const loading = workouts.loading;
  const error = workouts.error;
  const workoutTitles: Record<string, string> = {};
  for (const w of data) workoutTitles[w.id] = w.title;

  async function handleDelete(id: string) {
    if (!confirm('Delete this workout?')) return;
    await trainingApi.deleteWorkout(id);
    workouts.reload();
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Workout library" subtitle="Create, organize, and assign training sessions." actionLabel="Build workout" actionHref="/coach/workouts/builder" />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Library className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Workouts</p>
                  <p className="text-2xl font-black">{data.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Dumbbell className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                  <p className="text-2xl font-black">{exerciseCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardList className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                  <p className="text-2xl font-black">{assignmentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowCreateExercise(true)}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition"
          >
            <Video className="h-4 w-4 text-flow" /> New exercise
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <ListIcon className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${view === 'calendar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
        </div>

        {assignDate && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
            <span>Schedule for <strong>{new Date(assignDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong> — click <strong>Assign</strong> on a workout below</span>
            <button onClick={() => setAssignDate('')} className="ml-auto rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition">Clear</button>
          </div>
        )}

        {view === 'calendar' ? (
          <div className="mt-4">
            <TrainingCalendar onAssignDate={setAssignDate} onCardClick={(a: WorkoutAssignment) => router.push(`/coach/workouts/builder?id=${a.workoutId}`)} workoutTitles={workoutTitles} />
          </div>
        ) : loading ? (
          <div className="mt-5 space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <div className="mt-5"><ErrorState message={error} onRetry={workouts.reload} /></div>
        ) : data.length === 0 ? (
          <Link href="/coach/workouts/builder">
            <Card className="mt-5 border-dashed border-primary/30 transition hover:bg-muted">
              <CardContent className="flex items-center justify-center gap-3 p-6">
                <Plus className="h-5 w-5 text-primary" />
                <p className="font-bold text-primary">Create your first workout</p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div className="mt-5 space-y-3">
            <h3 className="text-lg font-black">Your workouts</h3>
            {data.map((w: any) => (
              <Card key={w.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate">{w.title}</p>
                      <span className="text-xs text-muted-foreground">({w.exercises?.length ?? 0} exercises)</span>
                    </div>
                    {w.description && <p className="mt-0.5 text-sm text-muted-foreground truncate">{w.description}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      onClick={() => setAssignTarget(w.id)}
                      title="Assign to client"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/coach/workouts/builder?id=${w.id}`}
                      className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                      title="View workout"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-pulse transition"
                      onClick={() => handleDelete(w.id)}
                      title="Delete workout"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {assignTarget && (
          <AssignWorkoutModal
            workoutId={assignTarget}
            assignedForDate={assignDate || undefined}
            onClose={() => setAssignTarget(null)}
            onAssigned={() => { setAssignTarget(null); setAssignDate(''); workouts.reload(); assignments.reload(); }}
          />
        )}

        {showCreateExercise && (
          <CreateExerciseDialog
            onClose={() => setShowCreateExercise(false)}
            onCreated={() => exercises.reload()}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
