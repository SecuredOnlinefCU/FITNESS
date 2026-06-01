'use client';

import { useState, useCallback, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { recoveryApi } from '@/lib/api/modules/recovery';
import { Watch, Moon, Heart, Footprints, Activity, TrendingUp, Sparkles, Plus, X, Loader } from 'lucide-react';
import type { ApiList, RecoverySnapshot } from '@/lib/types/domain';

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-8 w-full bg-muted rounded" />;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

export default function ClientRecoveryPage() {
  const todayResult = useAsyncData(() => recoveryApi.today() as Promise<ApiList<RecoverySnapshot>>, []);
  const historyResult = useAsyncData(() => recoveryApi.history(30) as Promise<ApiList<RecoverySnapshot>>, []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sleepMinutes: '', sleepScore: '', hrvMs: '', restingHeartRate: '' });
  const [saving, setSaving] = useState(false);

  const recovery = todayResult.data?.items?.[0];
  const history = historyResult.data?.items ?? [];

  const loading = todayResult.loading;
  const error = todayResult.error;

  const sleepHistory = useMemo(() => history.map(h => h.sleepMinutes ?? 0).reverse(), [history]);
  const readinessHistory = useMemo(() => history.map(h => h.readinessScore ?? 0).reverse(), [history]);
  const hrvHistory = useMemo(() => history.map(h => h.hrvMs ?? 0).reverse(), [history]);

  const avgReadiness = readinessHistory.length > 0 ? Math.round(readinessHistory.reduce((a, b) => a + b, 0) / readinessHistory.length) : null;
  const avgSleep = sleepHistory.length > 0 ? Math.round(sleepHistory.filter(s => s > 0).reduce((a, b) => a + b, 0) / Math.max(1, sleepHistory.filter(s => s > 0).length)) : null;

  const handleLogRecovery = useCallback(async () => {
    setSaving(true);
    try {
      await recoveryApi.upsertMetric({
        sleepMinutes: form.sleepMinutes ? Number(form.sleepMinutes) : undefined,
        sleepScore: form.sleepScore ? Number(form.sleepScore) : undefined,
        hrvMs: form.hrvMs ? Number(form.hrvMs) : undefined,
        restingHeartRate: form.restingHeartRate ? Number(form.restingHeartRate) : undefined,
      });
      setForm({ sleepMinutes: '', sleepScore: '', hrvMs: '', restingHeartRate: '' });
      setShowForm(false);
      todayResult.reload();
      historyResult.reload();
    } finally {
      setSaving(false);
    }
  }, [form, todayResult, historyResult]);

  const guidance = (() => {
    if (!recovery) return null;
    const readiness = recovery.readinessScore ?? 50;
    const sleep = recovery.sleepMinutes ?? 420;
    if (readiness < 40) return { text: 'Readiness is low. Consider a lighter session today or take a rest day.', color: 'text-pulse' };
    if (sleep < 360) return { text: 'Sleep was under 6 hours. Prioritize sleep hygiene tonight — aim for 7+ hours.', color: 'text-energy' };
    if (readiness >= 80 && sleep >= 420) return { text: 'Great recovery! You\'re ready for a challenging session today.', color: 'text-flow' };
    return { text: 'Recovery looks moderate. Stick to your plan but listen to your body.', color: 'text-muted-foreground' };
  })();

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <div className="relative">
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-0 top-1/3 h-[500px] w-[500px] opacity-[0.05]">
            <img src="/images/auth-hero.png" alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        <DashboardShell>
          <ClientPageHeader title="Recovery" subtitle="Your readiness, sleep, and recovery signals — intelligently tracked." />

          <Card className="relative overflow-hidden border-flow/20">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-flow/5 blur-3xl" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Watch className="h-5 w-5 text-flow" />
                  <p className="text-sm font-bold uppercase tracking-wide text-flow">Wearable</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition" aria-label="Log recovery data">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-muted-foreground">
                {recovery?.provider && recovery.provider !== 'MANUAL' ? `Connected: ${recovery.provider}` : 'No device connected — log manually or connect a wearable.'}
              </p>
            </CardContent>
          </Card>

          {showForm && (
            <Card className="mt-4">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">Log recovery</h3>
                  <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-muted-foreground">Sleep (minutes)</label><input type="number" min={0} value={form.sleepMinutes} onChange={e => setForm(f => ({ ...f, sleepMinutes: e.target.value }))} placeholder="e.g. 420" className="w-full rounded-xl border border-border bg-card p-2.5 text-base" /></div>
                  <div><label className="text-xs text-muted-foreground">Sleep score (0-100)</label><input type="number" min={0} max={100} value={form.sleepScore} onChange={e => setForm(f => ({ ...f, sleepScore: e.target.value }))} placeholder="e.g. 75" className="w-full rounded-xl border border-border bg-card p-2.5 text-base" /></div>
                  <div><label className="text-xs text-muted-foreground">HRV (ms)</label><input type="number" min={0} value={form.hrvMs} onChange={e => setForm(f => ({ ...f, hrvMs: e.target.value }))} placeholder="e.g. 55" className="w-full rounded-xl border border-border bg-card p-2.5 text-base" /></div>
                  <div><label className="text-xs text-muted-foreground">Resting HR (bpm)</label><input type="number" min={0} value={form.restingHeartRate} onChange={e => setForm(f => ({ ...f, restingHeartRate: e.target.value }))} placeholder="e.g. 62" className="w-full rounded-xl border border-border bg-card p-2.5 text-base" /></div>
                </div>
                <Button onClick={handleLogRecovery} disabled={saving} className="w-full">
                  {saving ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save recovery data'}
                </Button>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]"><CardSkeleton /><CardSkeleton /></div>
          ) : error ? (
            <ErrorState message={error} onRetry={todayResult.reload} />
          ) : (
            <>
              <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
                <Card className="relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
                  <CardContent className="p-6">
                    <p className="text-sm font-bold uppercase tracking-wide text-primary">Readiness</p>
                    <p className="mt-2 text-6xl font-black tracking-tight md:text-7xl">
                      {recovery?.readinessScore ?? '--'}
                      {recovery?.readinessScore != null ? <span className="text-3xl text-muted-foreground">%</span> : null}
                    </p>
                    {avgReadiness != null && <p className="mt-1 text-xs text-muted-foreground">30-day avg: {avgReadiness}%</p>}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-flow/10 p-3 text-flow"><Moon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sleep</p>
                          <p className="text-2xl font-black">{recovery?.sleepMinutes ? `${Math.round(recovery.sleepMinutes / 60)}h` : '--h'}</p>
                          {avgSleep != null && <p className="text-[10px] text-muted-foreground">30-day avg: {Math.round(avgSleep / 60)}h</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-pulse/10 p-3 text-pulse"><Heart className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Heart rate</p>
                          <p className="text-2xl font-black">{recovery?.restingHeartRate ? `${recovery.restingHeartRate} bpm` : '-- bpm'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-muted p-3 text-primary"><Activity className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">HRV</p><p className="text-xl font-black">{recovery?.hrvMs ? `${recovery.hrvMs} ms` : '-- ms'}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-muted p-3 text-primary"><Footprints className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Steps</p><p className="text-xl font-black">{recovery?.steps ?? '--'}</p></div></div></CardContent></Card>
                <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-muted p-3 text-primary"><TrendingUp className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Calories</p><p className="text-xl font-black">{recovery?.caloriesBurned ?? '--'}</p></div></div></CardContent></Card>
              </div>
            </>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-2 font-bold">Sleep trend</h3>
                <MiniSparkline data={sleepHistory} color="#38bdf8" />
                {avgSleep != null && <p className="mt-1 text-xs text-muted-foreground">Avg: {Math.round(avgSleep / 60)}h</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-2 font-bold">Readiness trend</h3>
                <MiniSparkline data={readinessHistory} color="#d7ff2f" />
                {avgReadiness != null && <p className="mt-1 text-xs text-muted-foreground">Avg: {avgReadiness}%</p>}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold">Guidance</h3>
                    {guidance ? (
                      <p className={`mt-1 text-sm ${guidance.color}`}>{guidance.text}</p>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Log recovery data to get personalized guidance.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardShell>
      </div>
    </ProtectedRoute>
  );
}
