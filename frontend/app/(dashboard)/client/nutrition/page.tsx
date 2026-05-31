'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Utensils, Target, Droplets, Apple, ChevronDown, ChevronUp } from 'lucide-react';

const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack', OTHER: 'Other' };

function PlanDayCard({ day }: { day: { dayIndex: number; meals?: { mealType: string; title?: string | null; calories?: number | null; protein?: number | null; carbs?: number | null; fat?: number | null; instructions?: string | null }[] } }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardContent className="p-4">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between" aria-expanded={expanded}>
          <div className="flex items-center gap-2">
            <Apple className="h-4 w-4 text-primary" />
            <span className="font-bold">Day {day.dayIndex + 1}</span>
            <span className="text-xs text-muted-foreground">({day.meals?.length ?? 0} meals)</span>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        {expanded && day.meals?.map((meal, mi) => (
          <div key={mi} className="mt-3 rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{MEAL_LABELS[meal.mealType] || meal.mealType}</span>
              <span className="text-sm font-bold">{meal.title}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {meal.calories != null && <span>{meal.calories} cal</span>}
              {meal.protein != null && <span>P: {meal.protein}g</span>}
              {meal.carbs != null && <span>C: {meal.carbs}g</span>}
              {meal.fat != null && <span>F: {meal.fat}g</span>}
            </div>
            {meal.instructions && <p className="mt-1 text-xs text-muted-foreground">{meal.instructions}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ClientNutritionPage() {
  const mealLogs = useAsyncData(() => nutritionApi.listMealLogs(), []);
  const plans = useAsyncData(() => nutritionApi.listPlans(), []);
  const hydrationLogs = useAsyncData(() => nutritionApi.getHydration(), []);

  const loading = mealLogs.loading || plans.loading || hydrationLogs.loading;
  const error = mealLogs.error || plans.error || hydrationLogs.error;
  const mealCount = mealLogs.data?.items?.length ?? 0;
  const activePlan = plans.data?.items?.find((p) => p.planType === 'STRUCTURED') || plans.data?.items?.[0];
  const hydrationTotalMl = (hydrationLogs.data?.items ?? []).reduce((sum, h) => sum + h.amountMl, 0);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Nutrition" subtitle="Follow your plan, log meals, and track macro consistency." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { mealLogs.reload(); plans.reload(); hydrationLogs.reload(); }} />
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
                    <p className="text-sm text-muted-foreground">Hydration today</p>
                    <p className="text-2xl font-black">{hydrationTotalMl > 0 ? `${Math.round(hydrationTotalMl / 1000)}L` : '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activePlan?.days && activePlan.days.length > 0 ? (
          <div className="mt-5 space-y-3">
            <h2 className="text-lg font-black">{activePlan.title}</h2>
            {activePlan.notes && <p className="text-sm text-muted-foreground">{activePlan.notes}</p>}
            {activePlan.days.sort((a, b) => a.dayIndex - b.dayIndex).map((day) => (
              <PlanDayCard key={day.id} day={day} />
            ))}
          </div>
        ) : (
          <Card className="mt-5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black">Today&apos;s macros</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Macro breakdown and meal timing recommendations will appear once you log meals or your coach assigns a plan.</p>
            </CardContent>
          </Card>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
