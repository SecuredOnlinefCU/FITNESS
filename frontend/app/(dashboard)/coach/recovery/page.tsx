'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { workoutWarningsApi } from '@/lib/api/modules/workout-warnings';
import { recoveryApi as clientRecovery } from '@/lib/api/modules/recovery';
import { RefreshCcw, Watch, AlertTriangle, Users, TrendingUp, Activity, ShieldCheck } from 'lucide-react';

export default function CoachRecoveryPage() {
  const warnings = useAsyncData(() => workoutWarningsApi.list(), []);
  const recoveryData = useAsyncData(() => clientRecovery.today(), []);
  const warningItems = warnings.data?.items ?? [];
  const recoveryItems = recoveryData.data?.items ?? [];

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
                <p className="mt-1 text-2xl font-black text-pulse">{warningItems.filter((w: any) => w.severity === 'HIGH' || w.severity === 'CRITICAL').length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Wearable coverage</p>
                <p className="mt-1 text-2xl font-black text-flow">{recoveryItems.length > 0 ? `${Math.round((recoveryItems.filter((r: any) => r.provider !== 'MANUAL').length / recoveryItems.length) * 100)}%` : '0%'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Avg readiness</p>
                <p className="mt-1 text-2xl font-black">
                  {recoveryItems.length > 0
                    ? `${Math.round(recoveryItems.reduce((s: number, r: any) => s + (r.readinessScore ?? 0), 0) / recoveryItems.length)}%`
                    : '--%'}
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
                  {warningItems.map((w: any) => (
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
                <p className="mt-2 text-sm text-muted-foreground">Clients with declining readiness or sleep scores will be listed here.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Watch className="h-5 w-5 text-flow" />
                  <h2 className="text-lg font-black">Wearable sync coverage</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Percentage of clients with active wearable data syncing in the last 48 hours.</p>
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
              <p className="mt-2 text-sm text-muted-foreground">Average sleep duration and quality trends across your client roster.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black">Readiness trends</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Aggregated readiness scores to spot population-level recovery patterns.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
