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
import { Dumbbell, Library, ClipboardList, Plus, Trash2, UserPlus, Eye, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function CoachWorkoutsPage() {
  const workouts = useAsyncData(() => trainingApi.listWorkouts(), []);
  const exercises = useAsyncData(() => trainingApi.listExercises(), []);
  const assignments = useAsyncData(() => trainingApi.listAssignments(), []);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  const data = workouts.data?.items ?? [];
  const exerciseCount = exercises.data?.items?.length ?? 0;
  const assignmentCount = assignments.data?.items?.length ?? 0;
  const loading = workouts.loading;
  const error = workouts.error;

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

        {loading ? (
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
            onClose={() => setAssignTarget(null)}
            onAssigned={() => { setAssignTarget(null); workouts.reload(); assignments.reload(); }}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
