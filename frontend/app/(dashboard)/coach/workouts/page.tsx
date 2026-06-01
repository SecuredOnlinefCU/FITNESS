'use client';

import { useState, useEffect } from 'react';
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
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Dumbbell, Library, ClipboardList, Plus, Trash2, UserPlus, Eye, CalendarDays, List as ListIcon, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { WorkoutAssignment, WorkoutExercise } from '@/lib/types/domain';
type WorkoutWithExercises = { id: string; coachUserId: string; title: string; description?: string | null; programId?: string | null; weekId?: string | null; dayIndex?: number | null; createdAt?: string | null; exercises?: { id: string }[] };

export default function CoachWorkoutsPage() {
  const router = useRouter();
  const workouts = useAsyncData(() => trainingApi.listWorkouts(), []);
  const exercises = useAsyncData(() => trainingApi.listExercises(), []);
  const assignments = useAsyncData(() => trainingApi.listAssignments(), []);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [assignDate, setAssignDate] = useState<string>('');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assignId = params.get('assign');
    if (assignId) {
      setAssignTarget(assignId);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const data = workouts.data?.items ?? [];
  const exerciseCount = exercises.data?.items?.length ?? 0;
  const assignmentCount = assignments.data?.items?.length ?? 0;
  const loading = workouts.loading;
  const error = workouts.error;
  const workoutTitles: Record<string, string> = {};
  for (const w of data) workoutTitles[w.id] = w.title;

  async function handleDelete(id: string) {
    await trainingApi.deleteWorkout(id);
    workouts.reload();
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="max-w-6xl mx-auto space-y-12">
          <CoachPageHeader title="Workout library" subtitle="Create, organize, and assign training sessions." actionLabel="Build workout" actionHref="/coach/workouts/builder" />

          <section>
            <h2 className="text-base font-black text-muted-foreground tracking-widest uppercase mb-4">Overview</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-muted p-3.5 text-primary"><Library className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Workouts</p>
                      <p className="text-3xl font-black mt-0.5">{data.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-muted p-3.5 text-primary"><Dumbbell className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Exercises</p>
                      <p className="text-3xl font-black mt-0.5">{exerciseCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-muted p-3.5 text-primary"><ClipboardList className="h-6 w-6" /></div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Assignments</p>
                      <p className="text-3xl font-black mt-0.5">{assignmentCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-muted-foreground tracking-widest uppercase">Exercise library</h2>
              <button
                onClick={() => setShowCreateExercise(true)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition"
              >
                <Video className="h-4 w-4" /> New exercise
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} in your library. Add exercises with demo videos and coach cues.</p>
            {exerciseCount === 0 && (
              <Card className="border-dashed border-border">
                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                  <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
                  <p className="font-bold text-muted-foreground">No exercises yet</p>
                  <p className="text-sm text-muted-foreground max-w-md">Create exercises with demo videos and coaching cues so your clients can see proper form.</p>
                  <button onClick={() => setShowCreateExercise(true)} className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">Create exercise</button>
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-muted-foreground tracking-widest uppercase">Schedule & workouts</h2>
              <div className="flex items-center gap-2">
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
            </div>

            {assignDate && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 text-sm">
                <span>Schedule for <strong>{new Date(assignDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong> — click <strong>Assign</strong> on a workout below</span>
                <button onClick={() => setAssignDate('')} className="ml-auto rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition">Clear</button>
              </div>
            )}

            {view === 'calendar' ? (
              <div>
                <TrainingCalendar onAssignDate={setAssignDate} onCardClick={(a: WorkoutAssignment) => router.push(`/coach/workouts/builder?id=${a.workoutId}`)} workoutTitles={workoutTitles} />
              </div>
            ) : loading ? (
              <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
            ) : error ? (
              <ErrorState message={error} onRetry={workouts.reload} />
            ) : data.length === 0 ? (
              <Link href="/coach/workouts/builder">
                <Card className="border-dashed border-primary/30 transition hover:bg-muted">
                  <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                    <Plus className="h-8 w-8 text-primary" />
                    <p className="font-bold text-primary">Create your first workout</p>
                    <p className="text-sm text-muted-foreground">Build a workout with exercises, sets, reps, and RPE targets.</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div className="space-y-3">
                {data.map((w: WorkoutWithExercises) => (
                  <Card key={w.id}>
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-base truncate">{w.title}</p>
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{w.exercises?.length ?? 0} exercises</span>
                        </div>
                        {w.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{w.description}</p>}
                        <p className="mt-1.5 text-xs text-muted-foreground/60">Created {new Date(w.createdAt ?? new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          className="rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          onClick={() => setAssignTarget(w.id)}
                          title="Assign to client"
                        >
                          <UserPlus className="h-4 w-4 mr-1.5 inline-block" />Assign
                        </button>
                        <Link
                          href={`/coach/workouts/builder?id=${w.id}`}
                          className="rounded-xl p-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          title="View workout"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="rounded-xl p-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-pulse transition"
                              title="Delete workout"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete workout</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete "{w.title}" and all its exercises. This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(w.id)} className="bg-pulse hover:bg-pulse/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {assignTarget && (
            <AssignWorkoutModal
              workoutId={assignTarget}
              assignedForDate={assignDate || undefined}
              onClose={() => { setAssignTarget(null); window.history.replaceState({}, '', window.location.pathname); }}
              onAssigned={() => { setAssignTarget(null); setAssignDate(''); workouts.reload(); assignments.reload(); }}
            />
          )}

          {videoUrl && <VideoPlayerModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}

          {showCreateExercise && (
            <CreateExerciseDialog
              onClose={() => setShowCreateExercise(false)}
              onCreated={() => exercises.reload()}
            />
          )}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
