'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { Utensils, Target, Droplets, Apple } from 'lucide-react';

export default function ClientNutritionPage() {
  const mealLogs = useAsyncData(() => apiFetch<{ items: any[] }>('/api/nutrition/meal-logs'), []);
  const plans = useAsyncData(() => apiFetch<{ items: any[] }>('/api/nutrition/plans'), []);

  const loading = mealLogs.loading || plans.loading;
  const error = mealLogs.error || plans.error;
  const mealCount = mealLogs.data?.items?.length ?? 0;
  const activePlan = plans.data?.items?.[0];

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Nutrition" subtitle="Follow your plan, log meals, and track macro consistency." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { mealLogs.reload(); plans.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Apple className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meals logged</p>
                    <p className="text-2xl font-black">{mealCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Target className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active plan</p>
                    <p className="text-2xl font-black">{activePlan?.title || 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Droplets className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hydration logged</p>
                    <p className="text-2xl font-black">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Today&apos;s macros</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Macro breakdown and meal timing recommendations will appear once you log meals or your coach assigns a plan.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
