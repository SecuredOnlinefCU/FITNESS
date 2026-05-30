'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { Utensils, Target, ClipboardList } from 'lucide-react';

export default function CoachNutritionPage() {
  const plans = useAsyncData(() => apiFetch<{ items: any[] }>('/api/nutrition/plans'), []);
  const mealLogs = useAsyncData(() => apiFetch<{ items: any[] }>('/api/nutrition/meal-logs'), []);

  const loading = plans.loading || mealLogs.loading;
  const error = plans.error || mealLogs.error;

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Nutrition planning" subtitle="Create meal plans, set macro targets, and review client meal logs." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { plans.reload(); mealLogs.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Utensils className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meal plans</p>
                    <p className="text-2xl font-black">{plans.data?.items?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Target className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Macro targets</p>
                    <p className="text-2xl font-black">{plans.data?.items?.filter((p: any) => p.planType === 'MACRO_ONLY').length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardList className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meal log review</p>
                    <p className="text-2xl font-black">{mealLogs.data?.items?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
