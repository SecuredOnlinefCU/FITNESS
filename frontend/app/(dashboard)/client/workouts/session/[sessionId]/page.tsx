'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { Button } from '@/components/ui/button';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { trainingApi } from '@/lib/api/modules/training';
import { Dumbbell, CheckCircle, Plus, X, Video, Info, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { RestTimer } from '@/components/workout/rest-timer';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';

const SET_TYPE_OPTIONS = [
  { value: 'warmup', label: 'Warm-up' },
  { value: 'working', label: 'Working' },
  { value: 'backoff', label: 'Back-off' },
  { value: 'drop', label: 'Drop set' },
  { value: 'failure', label: 'To failure' },
];

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const sessionResult = useAsyncData(
    () => trainingApi.getSession(sessionId),
    [sessionId],
  );

  const [loggingExercise, setLoggingExercise] = useState<string | null>(null);
  const [logForm, setLogForm] = useState({ reps: 10, weight: 0, rpe: 7, setType: 'working', notes: '' });
  const [completing, setCompleting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(90);
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [adjustments, setAdjustments] = useState<Record<string, { adjustment: string; reason: string; adjusted: { sets: number; reps: string | null; rpe: number | null } }>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const session = sessionResult.data;
  const loading = sessionResult.loading;
  const error = sessionResult.error;

  const sortedExercises = [...(session?.assignment?.workout?.exercises ?? [])].sort((a: any, b: any) => a.orderIndex - b.orderIndex) as Array<{ id: string; orderIndex: number; exercise?: { name?: string | null; demoVideoUrl?: string | null; coachCues?: string | null } | null; prescribedSets?: number | null; prescribedReps?: string | null; prescribedRestSeconds?: number | null; prescribedRpe?: number | null; supersetGroupId?: string | null; tempo?: string | null }>;
  const totalExercises = sortedExercises.length;
  const completedExercises = sortedExercises.filter(we => {
    const logged = session?.sets?.filter((s: any) => s.workoutExerciseId === we.id) ?? [];
    return logged.length >= (we.prescribedSets ?? 3);
  }).length;

  const sessionRpe = (() => {
    const allSets = session?.sets ?? [];
    if (allSets.length === 0) return null;
    const rpeSets = allSets.filter(s => s.rpe != null);
    if (rpeSets.length === 0) return null;
    return Math.round(rpeSets.reduce((sum, s) => sum + (s.rpe || 0), 0) / rpeSets.length * 10) / 10;
  })();

  const fetchAdjustment = useCallback(async (workoutExerciseId: string) => {
    if (adjustments[workoutExerciseId]) return;
    try {
      const result = await trainingApi.getAdaptiveAdjustment(workoutExerciseId);
      setAdjustments(prev => ({ ...prev, [workoutExerciseId]: result }));
    } catch { /* ignore */ }
  }, [adjustments]);

  const handleLogSet = useCallback(async (workoutExerciseId: string, restSeconds?: number) => {
    if (!session) return;
    const currentSets = session.sets?.filter((s) => s.workoutExerciseId === workoutExerciseId) ?? [];
    await trainingApi.logSet(sessionId, {
      workoutExerciseId,
      setNumber: currentSets.length + 1,
      reps: logForm.reps,
      weight: logForm.weight,
      rpe: logForm.rpe,
      setType: logForm.setType,
      notes: logForm.notes || undefined,
    });
    setLoggingExercise(null);
    setLogForm({ reps: 10, weight: 0, rpe: 7, setType: 'working', notes: '' });
    sessionResult.reload();
    if (restSeconds && restSeconds > 0) {
      setTimerDuration(restSeconds);
      setShowTimer(true);
    }
  }, [session, sessionId, logForm, sessionResult]);

  const handleComplete = useCallback(async () => {
    setCompleting(true);
    await trainingApi.completeSession(sessionId);
    router.push('/client/workouts');
  }, [sessionId, router]);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        {loading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
        ) : error || !session ? (
          <ErrorState message={error || 'Session not found'} onRetry={sessionResult.reload} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black">{session.assignment?.workout?.title || 'Workout'}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedExercises} of {totalExercises} exercises done
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setGuidedMode(!guidedMode); setCurrentExerciseIdx(0); }}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition ${guidedMode ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                >
                  {guidedMode ? 'Guided' : 'List'}
                </button>
                <Button onClick={handleComplete} disabled={completing}>
                  {completing ? 'Finishing...' : 'Finish'}
                </Button>
              </div>
            </div>

            {totalExercises > 0 && (
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(completedExercises / totalExercises) * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {Math.round((completedExercises / totalExercises) * 100)}% complete
                  </p>
                  {sessionRpe != null && (
                    <div className="flex items-center gap-1.5">
                      <Zap className={`h-3 w-3 ${sessionRpe >= 8 ? 'text-pulse' : sessionRpe >= 6 ? 'text-energy' : 'text-flow'}`} />
                      <span className={`text-xs font-bold ${sessionRpe >= 8 ? 'text-pulse' : sessionRpe >= 6 ? 'text-energy' : 'text-flow'}`}>
                        Session RPE: {sessionRpe}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {(guidedMode ? sortedExercises.slice(currentExerciseIdx, currentExerciseIdx + 1) : sortedExercises).map((we, i) => {
                const globalIdx = guidedMode ? currentExerciseIdx : i;
                const loggedSets = session.sets?.filter((s) => s.workoutExerciseId === we.id) ?? [];
                const isLogging = loggingExercise === we.id;
                const setsDone = loggedSets.length;
                const setsTotal = we.prescribedSets ?? 3;
                const isExerciseComplete = setsDone >= setsTotal;

                const exerciseCard = (
                  <div key={we.id}>
                    <Card className={isExerciseComplete ? 'border-primary/30 bg-primary/5' : ''}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${isExerciseComplete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                              {isExerciseComplete ? '\u2713' : globalIdx + 1}
                            </span>
                            <div>
                              <p className="font-bold">{we.exercise?.name || 'Exercise'}</p>
                              <p className="text-xs text-muted-foreground">
                                {we.prescribedSets ? `${we.prescribedSets}\u00d7${we.prescribedReps}` : ''}
                                {we.prescribedRpe ? ` @ RPE ${we.prescribedRpe}` : ''}
                                {we.prescribedRestSeconds ? ` \u00b7 ${we.prescribedRestSeconds}s rest` : ''}
                                {we.tempo ? ` \u00b7 ${we.tempo}` : ''}
                                {we.supersetGroupId ? ' \u00b7 Superset' : ''}
                                {setsDone > 0 && <span className="ml-2 font-bold text-primary">{setsDone}/{setsTotal} sets</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {we.exercise?.demoVideoUrl && (
                              <button onClick={() => setVideoUrl(we.exercise!.demoVideoUrl!)} className="rounded-lg p-1.5 text-primary hover:bg-primary/10 transition" aria-label="Watch demo video">
                                <Video className="h-4 w-4" />
                              </button>
                            )}
                            {we.exercise?.coachCues && (
                              <div className="group relative">
                                <span className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition cursor-help" aria-label="Coach cues">
                                  <Info className="h-4 w-4" />
                                </span>
                                <div className="absolute right-0 top-full z-10 mt-1 hidden w-64 rounded-xl border border-border bg-card p-3 text-xs shadow-lg group-hover:block">
                                  <p className="font-bold text-foreground">Coach cues</p>
                                  <p className="mt-1 text-muted-foreground">{we.exercise.coachCues}</p>
                                </div>
                              </div>
                            )}
                            <Dumbbell className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>

                        {loggedSets.length > 0 && (
                          <div className="space-y-1">
                            {loggedSets.map((set) => (
                              <div key={set.id} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-1.5 text-xs">
                                <span className="font-bold text-muted-foreground">Set {set.setNumber}</span>
                                <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${set.setType === 'warmup' ? 'bg-flow/10 text-flow' : set.setType === 'drop' ? 'bg-pulse/10 text-pulse' : set.setType === 'failure' ? 'bg-energy/10 text-energy' : 'bg-primary/10 text-primary'}`}>
                                  {SET_TYPE_OPTIONS.find(o => o.value === set.setType)?.label || set.setType}
                                </span>
                                <span>{set.reps} reps</span>
                                {set.weight ? <span>@ {set.weight}kg</span> : null}
                                {set.rpe ? <span>RPE {set.rpe}</span> : null}
                                {set.notes && <span className="text-muted-foreground">&mdash; {set.notes}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {adjustments[we.id] && adjustments[we.id].adjustment === 'modified' && (
                          <div className="flex items-start gap-2 rounded-lg bg-flow/5 border border-flow/20 p-2">
                            {adjustments[we.id].adjusted.sets < (we.prescribedSets ?? 3) ? (
                              <TrendingDown className="mt-0.5 h-3.5 w-3.5 text-flow shrink-0" />
                            ) : (
                              <TrendingUp className="mt-0.5 h-3.5 w-3.5 text-flow shrink-0" />
                            )}
                            <div>
                              <p className="text-[11px] font-bold text-flow">Adaptive adjustment</p>
                              <p className="text-[11px] text-muted-foreground">{adjustments[we.id].reason}</p>
                              <p className="text-[11px] font-bold text-foreground mt-0.5">
                                {adjustments[we.id].adjusted.sets}\u00d7{adjustments[we.id].adjusted.reps} (was {we.prescribedSets}\u00d7{we.prescribedReps})
                              </p>
                            </div>
                          </div>
                        )}

                        {isLogging ? (
                          <div className="space-y-2 rounded-lg border border-border p-3">
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">Reps</label>
                                <input type="number" min={0} value={logForm.reps} onChange={e => setLogForm(f => ({ ...f, reps: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-base text-center" aria-label="Reps" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Weight</label>
                                <input type="number" min={0} step={0.5} value={logForm.weight} onChange={e => setLogForm(f => ({ ...f, weight: Number(e.target.value) }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-base text-center" aria-label="Weight" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Type</label>
                                <select value={logForm.setType} onChange={e => setLogForm(f => ({ ...f, setType: e.target.value }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-sm" aria-label="Set type">
                                  {SET_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">RPE (how hard was it?)</label>
                              <div className="mt-1 flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                  <button
                                    key={r}
                                    type="button"
                                    onClick={() => setLogForm(f => ({ ...f, rpe: r }))}
                                    className={`flex-1 min-h-[44px] rounded-lg py-2 text-xs font-bold transition ${
                                      logForm.rpe === r
                                        ? r <= 3 ? 'bg-flow text-primary-foreground' : r <= 6 ? 'bg-energy text-primary-foreground' : 'bg-pulse text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                  >
                                    {r}
                                  </button>
                                ))}
                              </div>
                              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                                <span>Easy</span>
                                <span>Moderate</span>
                                <span>Max effort</span>
                              </div>
                            </div>
                            <input placeholder="Notes (optional)" value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} className="w-full rounded-lg border border-border bg-card p-1.5 text-base" aria-label="Optional notes" />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setLoggingExercise(null)} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-muted-foreground hover:text-foreground" aria-label="Cancel logging set"><X className="h-4 w-4" /></button>
                              <button type="button" onClick={() => handleLogSet(we.id, we.prescribedRestSeconds ?? undefined)} className="min-h-[44px] rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Log set</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setLoggingExercise(we.id); fetchAdjustment(we.id); }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          >
                            <Plus className="h-4 w-4" /> Log set {loggedSets.length + 1}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                    {guidedMode && isExerciseComplete && currentExerciseIdx < totalExercises - 1 && (
                      <button
                        onClick={() => setCurrentExerciseIdx(prev => prev + 1)}
                        className="w-full rounded-xl border border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary hover:bg-primary/10 transition"
                      >
                        Next exercise &rarr;
                      </button>
                    )}
                    {guidedMode && isExerciseComplete && currentExerciseIdx === totalExercises - 1 && (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
                      >
                        {completing ? 'Finishing...' : 'Complete workout'}
                      </button>
                    )}
                  </div>
                );
                return exerciseCard;
              })}
            </div>

            {(session.assignment?.workout?.exercises?.length ?? 0) > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={handleComplete} disabled={completing} className="gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {completing ? 'Finishing...' : 'Complete workout'}
                </Button>
              </div>
            )}
          </>
        )}
      </DashboardShell>

      <AnimatePresence>
        {showTimer && (
          <RestTimer
            duration={timerDuration}
            onComplete={() => setShowTimer(false)}
            onSkip={() => setShowTimer(false)}
          />
        )}
      </AnimatePresence>

      {videoUrl && (
        <VideoPlayerModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />
      )}
    </ProtectedRoute>
  );
}
