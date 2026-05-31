'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trainingApi } from '@/lib/api/modules/training';
import { Dumbbell, CheckCircle, Plus, X } from 'lucide-react';

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingExercise, setLoggingExercise] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({ reps: 10, weight: 0, rpe: 7, notes: '' });
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    trainingApi.getSession(sessionId).then(setSession).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [sessionId]);

  async function handleLogSet(workoutExerciseId: string) {
    const currentSets = session.sets?.filter((s: any) => s.workoutExerciseId === workoutExerciseId) ?? [];
    await trainingApi.logSet(sessionId, {
      workoutExerciseId,
      setNumber: currentSets.length + 1,
      reps: logForm.reps,
      weight: logForm.weight,
      rpe: logForm.rpe,
      notes: logForm.notes || undefined,
    });
    setLoggingExercise(null);
    setLogForm({ reps: 10, weight: 0, rpe: 7, notes: '' });
    const updated = await trainingApi.getSession(sessionId);
    setSession(updated);
  }

  async function handleComplete() {
    setCompleting(true);
    await trainingApi.completeSession(sessionId);
    router.push('/client/workouts');
  }

  if (loading) {
    return (
      <ProtectedRoute roles={['client', 'super_admin']}>
        <DashboardShell>
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading session...</div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  if (error || !session) {
    return (
      <ProtectedRoute roles={['client', 'super_admin']}>
        <DashboardShell>
          <div className="flex items-center justify-center py-20">
            <Card><CardContent className="p-6 text-sm text-muted-foreground">{error || 'Session not found'}</CardContent></Card>
          </div>
        </DashboardShell>
      </ProtectedRoute>
    );
  }

  const workout = session.assignment?.workout;
  const exercises = workout?.exercises ?? [];
  const sortedExercises = [...exercises].sort((a: any, b: any) => a.orderIndex - b.orderIndex);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">{workout?.title || 'Workout'}</h1>
            <p className="text-sm text-muted-foreground">Log your sets as you complete them.</p>
          </div>
          <Button onClick={handleComplete} disabled={completing}>
            {completing ? 'Finishing...' : 'Finish workout'}
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {sortedExercises.map((we: any, i: number) => {
            const loggedSets = session.sets?.filter((s: any) => s.workoutExerciseId === we.id) ?? [];
            const isLogging = loggingExercise === we.id;

            return (
              <Card key={we.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                      <div>
                        <p className="font-bold">{we.exercise?.name || 'Exercise'}</p>
                        <p className="text-xs text-muted-foreground">
                          {we.prescribedSets ? `${we.prescribedSets}×${we.prescribedReps}` : ''}
                          {we.prescribedRestSeconds ? ` · ${we.prescribedRestSeconds}s rest` : ''}
                          {we.tempo ? ` · ${we.tempo}` : ''}
                        </p>
                      </div>
                    </div>
                    <Dumbbell className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {loggedSets.length > 0 && (
                    <div className="space-y-1">
                      {loggedSets.map((set: any) => (
                        <div key={set.id} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-1.5 text-xs">
                          <span className="font-bold text-muted-foreground">Set {set.setNumber}</span>
                          <span>{set.reps} reps</span>
                          {set.weight ? <span>@ {set.weight}kg</span> : null}
                          {set.rpe ? <span>RPE {set.rpe}</span> : null}
                          {set.notes && <span className="text-muted-foreground">— {set.notes}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {isLogging ? (
                    <div className="space-y-2 rounded-lg border border-border p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Reps</label>
                          <input type="number" min={0} value={logForm.reps} onChange={e => setLogForm(f => ({ ...f, reps: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-sm text-center" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Weight (kg)</label>
                          <input type="number" min={0} step={0.5} value={logForm.weight} onChange={e => setLogForm(f => ({ ...f, weight: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-sm text-center" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">RPE</label>
                          <input type="number" min={1} max={10} value={logForm.rpe} onChange={e => setLogForm(f => ({ ...f, rpe: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-sm text-center" />
                        </div>
                      </div>
                      <input placeholder="Notes (optional)" value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-sm" />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setLoggingExercise(null)} className="text-xs text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleLogSet(we.id)} className="rounded-xl bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Log set</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLoggingExercise(we.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    >
                      <Plus className="h-4 w-4" /> Log set {loggedSets.length + 1}
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {sortedExercises.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleComplete} disabled={completing} className="gap-2">
              <CheckCircle className="h-5 w-5" />
              {completing ? 'Finishing...' : 'Complete workout'}
            </Button>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
