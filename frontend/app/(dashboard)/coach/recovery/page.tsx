'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { workoutWarningsApi } from '@/lib/api/modules/workout-warnings';
import { recoveryApi as clientRecovery } from '@/lib/api/modules/recovery';
import type { RecoverySnapshot } from '@/lib/types/domain';
import { RefreshCcw, Watch, AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';

type WarningItem = { id: string; title: string; body?: string; severity: string; clientUserId: string; createdAt: string };

export default function CoachRecoveryPage() {
  const warnings = useAsyncData(() => workoutWarningsApi.list(), []);
  const recoveryData = useAsyncData(() => clientRecovery.today(), []);
  const historyData = useAsyncData(() => clientRecovery.history(30), []);
  const warningItems: WarningItem[] = warnings.data?.items ?? [];
  const recoveryItems: RecoverySnapshot[] = recoveryData.data?.items ?? [];
  const historyItems: RecoverySnapshot[] = historyData.data?.items ?? [];

  const atRiskCount = warningItems.filter(w => w.severity === 'HIGH' || w.severity === 'CRITICAL').length;
  const wearableCount = recoveryItems.filter(r => r.provider !== 'MANUAL').length;
  const wearablePct = recoveryItems.length > 0 ? Math.round((wearableCount / recoveryItems.length) * 100) : 0;
  const avgReadiness = recoveryItems.length > 0
    ? Math.round(recoveryItems.reduce((s, r) => s + (r.readinessScore ?? 0), 0) / recoveryItems.length)
    : null;

  const avgSleepScore = historyItems.length > 0
    ? Math.round(historyItems.reduce((s, r) => s + (r.sleepScore ?? 0), 0) / historyItems.length)
    : null;

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Recovery intelligence" subtitle="Sleep, readiness, and wearable signals that tell you when to adjust training load." />

        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <RefreshCcw className="h-5 w-5 text-primary" />
            <div>
              <p className="font-bold">Warning generation</p>
              <p className="text-sm text-muted-foreground">Scan all clients for recovery-based training adjustments</p>
            </div>
          </div>
          <Button onClick={() => workoutWarningsApi.generate().then(() => warnings.reload())}>Generate warnings</Button>
        </div>

        {warnings.loading || recoveryData.loading ? (
          <div className="grid gap-4 md:grid-cols-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Active warnings</p>
                <p className="mt-1 text-2xl font-black text-energy">{warningItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">At-risk clients</p>
                <p className="mt-1 text-2xl font-black text-pulse">{atRiskCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Wearable coverage</p>
                <p className="mt-1 text-2xl font-black text-flow">{wearablePct}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Avg readiness</p>
                <p className="mt-1 text-2xl font-black">
                  {avgReadiness !== null ? `${avgReadiness}%` : '--%'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-energy" />
                <h2 className="text-xl font-black">Active warnings</h2>
              </div>
              {warningItems.length === 0 ? (
                <div className="rounded-2xl bg-muted p-6 text-center">
                  <p className="font-bold text-muted-foreground">No active warnings</p>
                  <p className="mt-1 text-sm text-muted-foreground">Recovery warnings will appear here when readiness drops below thresholds.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {warningItems.map(w => (
                    <div key={w.id} className="flex items-center justify-between rounded-2xl border border-border p-4">
                      <div>
                        <p className="font-bold">{w.title}</p>
                        <p className="text-sm text-muted-foreground">{w.body}</p>
                      </div>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                        w.severity === 'HIGH' || w.severity === 'CRITICAL' ? 'bg-pulse/10 text-pulse' : 'bg-energy/10 text-energy'
                      }`}>{w.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black">At-risk recovery clients</h2>
                </div>
                {atRiskCount > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {warningItems.filter(w => w.severity === 'HIGH' || w.severity === 'CRITICAL').slice(0, 5).map(w => (
                      <li key={w.id} className="flex items-center justify-between rounded-xl border border-border bg-pulse/5 p-3 text-sm">
                        <span className="font-bold">{w.title}</span>
                        <span className="text-pulse">{w.severity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No clients with critical recovery flags.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Watch className="h-5 w-5 text-flow" />
                  <h2 className="text-lg font-black">Wearable sync coverage</h2>
                </div>
                {recoveryItems.length > 0 ? (
                  <div className="mt-3">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">{wearableCount} of {recoveryItems.length} clients</span>
                      <span className="text-lg font-black text-flow">{wearablePct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-flow" style={{ width: `${wearablePct}%` }} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No wearable data available yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black">Sleep trends</h2>
              </div>
              {historyItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">30-day avg sleep score</span>
                    <span className="text-xl font-black">{avgSleepScore ?? '--'}/100</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">30-day avg sleep duration</span>
                    <span className="text-xl font-black">
                      {(() => {
                        const valid = historyItems.filter(r => r.sleepMinutes);
                        if (valid.length === 0) return '-- min';
                        const avg = valid.reduce((s, r) => s + (r.sleepMinutes ?? 0), 0) / valid.length;
                        return `${Math.round(avg / 60)}h ${Math.round(avg % 60)}m`;
                      })()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Across {historyItems.length} recorded days</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No sleep data collected yet.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black">Readiness trends</h2>
              </div>
              {historyItems.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">30-day avg readiness</span>
                    <span className="text-xl font-black">
                      {avgReadiness !== null ? `${avgReadiness}%` : '--%'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Avg HRV</span>
                    <span className="text-xl font-black">
                      {(() => {
                        const valid = historyItems.filter(r => r.hrvMs);
                        if (valid.length === 0) return '-- ms';
                        const avg = valid.reduce((s, r) => s + (r.hrvMs ?? 0), 0) / valid.length;
                        return `${Math.round(avg)} ms`;
                      })()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Across {historyItems.length} recorded days</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No readiness data collected yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
