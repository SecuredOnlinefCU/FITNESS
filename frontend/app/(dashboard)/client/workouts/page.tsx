'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { trainingApi } from '@/lib/api/modules/training';
import { TrainingCalendar } from '@/components/workout/training-calendar';
import { toast } from 'sonner';
import type { Exercise, WorkoutAssignment, WorkoutSession } from '@/lib/types/domain';
import { Dumbbell, Timer, Trophy, Play, ChevronRight, CalendarDays, List as ListIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientWorkoutsPage() {
  const router = useRouter();
  const history = useAsyncData(() => trainingApi.getHistory(), []);
  const assignments = useAsyncData(() => trainingApi.listClientAssignments(), []);
  const exercises = useAsyncData(() => trainingApi.listExercises(), []);
  const [view, setView] = useState<'list' | 'calendar'>('calendar');

  const loading = history.loading || assignments.loading;
  const error = history.error || assignments.error;
  const completedCount = history.data?.items?.length ?? 0;
  const bestStreak = (() => {
    const dates = history.data?.items?.map(s => s.completedAt).filter(Boolean) as string[] | undefined;
    if (!dates?.length) return 0;
    const unique = [...new Set(dates.map(d => d.slice(0, 10)))].sort().reverse();
    let streak = 1, max = 1;
    for (let i = 1; i < unique.length; i++) {
      const diff = (new Date(unique[i - 1]).getTime() - new Date(unique[i]).getTime()) / 86400000;
      if (diff === 1) { streak++; max = Math.max(max, streak); }
      else streak = 1;
    }
    return max;
  })();
  const activeAssignments = assignments.data?.items?.filter((a: WorkoutAssignment) =>
    a.status !== 'completed' && !a.sessions?.some((s: WorkoutSession) => s.status === 'in_progress')
  ) ?? [];
  const inProgress = assignments.data?.items?.filter((a: WorkoutAssignment) =>
    a.sessions?.some((s: WorkoutSession) => s.status === 'in_progress')
  ) ?? [];
  const exerciseList = exercises.data?.items?.slice(0, 10) ?? [];

  async function handleStart(assignmentId: string) {
    try {
      const session = await trainingApi.startSession(assignmentId);
      router.push(`/client/workouts/session/${session.id}`);
    } catch {
      toast.error('Failed to start session');
    }
  }

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Train" subtitle="Your assigned training, workout history, and performance progression." />

        {loading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { history.reload(); assignments.reload(); }} />
        ) : (
          <>
            <div className="rounded-2xl border border-primary/20 bg-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-primary">Workout history</p>
                  <h2 className="mt-2 text-2xl font-black md:text-3xl">
                    {completedCount > 0 ? `${completedCount} session${completedCount === 1 ? '' : 's'} completed` : 'No sessions yet'}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />{completedCount} logged
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Dumbbell className="h-4 w-4" />{exerciseList.length} exercises
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4" />{bestStreak > 0 ? `${bestStreak} streak` : 'Best streak'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
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

            {view === 'calendar' ? (
              <div className="mt-2">
                <TrainingCalendar />
              </div>
            ) : (
              <>
                {inProgress.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-primary">In progress</h3>
                {inProgress.map((a: WorkoutAssignment) => {
                  const session = a.sessions?.find((s: WorkoutSession) => s.status === 'in_progress');
                      return (
                        <Link key={a.id} href={`/client/workouts/session/${session?.id}`}>
                          <Card className="border-primary/30 transition hover:bg-muted">
                            <CardContent className="flex items-center justify-between p-4">
                              <div>
                                <p className="font-bold">Active workout session</p>
                                <p className="text-sm text-muted-foreground">{session?.startedAt ? `Started ${new Date(session.startedAt).toLocaleString()}` : ''}</p>
                              </div>
                              <Play className="h-5 w-5 text-primary" />
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {activeAssignments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-bold text-foreground">Assigned workouts</h3>
                    {activeAssignments.slice(0, 5).map((a: WorkoutAssignment, i: number) => (
                      <Card key={a.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-bold">Workout #{i + 1}</p>
                            <p className="text-sm text-muted-foreground">Assigned {new Date(a.createdAt ?? new Date()).toLocaleDateString()}</p>
                          </div>
                          <button
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
                            onClick={() => handleStart(a.id)}
                          >
                            <Play className="h-4 w-4" /> Start
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {completedCount > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-bold text-primary">View recent sessions</summary>
                    <div className="mt-3 space-y-2">
                      {(history.data?.items ?? []).slice(0, 5).map((session: WorkoutSession, i: number) => {
                        const workoutTitle = session.assignment?.workout?.title;
                        return (
                          <div key={session.id || i} className="rounded-2xl border border-border p-3 text-sm text-muted-foreground">
                            {workoutTitle || `Session ${i + 1}`} &mdash; {session.sets?.length || 0} sets logged
                            {session.completedAt && <span className="ml-2 text-xs text-primary">Completed</span>}
                          </div>
                        );
                      })}
                    </div>
                  </details>
                )}

                {exerciseList.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <h3 className="text-lg font-black">Exercise library</h3>
                    {exerciseList.map((exercise: Exercise, i: number) => (
                      <Card key={exercise.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-muted-foreground">{i + 1}</div>
                            <div>
                              <p className="font-bold">{exercise.name}</p>
                              <p className="text-sm text-muted-foreground">{exercise.instructions?.slice(0, 60) || 'No instructions'}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Coach cues</h2>
              <p className="mt-2 text-sm text-muted-foreground">Coach notes and technique cues will appear during your workout.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Training programs</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your coach-assigned programs and periodization plan.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
