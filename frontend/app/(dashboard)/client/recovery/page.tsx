'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { recoveryApi } from '@/lib/api/modules/recovery';
import { Watch, Moon, Heart, Footprints, Activity, TrendingUp, Sparkles } from 'lucide-react';
import type { ApiList } from '@/lib/types/domain';

export default function ClientRecoveryPage() {
  const result = useAsyncData(() => recoveryApi.today() as Promise<ApiList<any>>, []);
  const recovery = result.data?.items?.[0];

  const loading = result.loading;
  const error = result.error;

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
              <div className="flex items-center gap-2">
                <Watch className="h-5 w-5 text-flow" />
                <p className="text-sm font-bold uppercase tracking-wide text-flow">Wearable</p>
              </div>
              <p className="mt-1 text-muted-foreground">Connect your wearable to unlock readiness scoring, sleep tracking, and recovery insights.</p>
              <div className="mt-4 inline-flex rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground">
                {recovery?.provider && recovery.provider !== 'MANUAL' ? recovery.provider : 'No device connected'}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_0.8fr]"><CardSkeleton /><CardSkeleton /></div>
          ) : error ? (
            <ErrorState message={error} onRetry={result.reload} />
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
                    <p className="mt-2 text-muted-foreground">Your daily readiness score based on sleep, HRV, and recovery signals.</p>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-flow/10 p-3 text-flow"><Moon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sleep</p>
                          <p className="text-2xl font-black">
                            {recovery?.sleepMinutes ? `${Math.round(recovery.sleepMinutes / 60)}h` : '--h'}
                          </p>
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
                          <p className="text-2xl font-black">
                            {recovery?.restingHeartRate ? `${recovery.restingHeartRate} bpm` : '-- bpm'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-primary"><Activity className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">HRV</p>
                        <p className="text-xl font-black">{recovery?.hrvMs ? `${recovery.hrvMs} ms` : '-- ms'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-primary"><Footprints className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Steps</p>
                        <p className="text-xl font-black">{recovery?.steps ?? '--'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-primary"><TrendingUp className="h-5 w-5" /></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Calories</p>
                        <p className="text-xl font-black">{recovery?.caloriesBurned ?? '--'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold">Recovery history</h2>
                <p className="mt-2 text-sm text-muted-foreground">Trend charts for sleep, readiness, and HRV will appear once we have enough data.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h2 className="font-bold">Guidance</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Recovery insights and coaching recommendations will adapt based on your wearable data.</p>
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
