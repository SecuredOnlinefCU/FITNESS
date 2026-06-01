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
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Utensils, Target, Droplets, Apple, ChevronDown, ChevronUp, Plus, X, Loader } from 'lucide-react';

const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack', OTHER: 'Other' };
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;

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
  const macroTargets = useAsyncData(() => nutritionApi.getMacroTargets(), []);

  const [showMealForm, setShowMealForm] = useState(false);
  const [mealForm, setMealForm] = useState({ mealType: 'BREAKFAST', title: '', calories: '', protein: '', carbs: '', fat: '' });
  const [loggingMeal, setLoggingMeal] = useState(false);
  const [loggingHydration, setLoggingHydration] = useState(false);

  const loading = mealLogs.loading || plans.loading || hydrationLogs.loading;
  const error = mealLogs.error || plans.error || hydrationLogs.error;
  const mealCount = mealLogs.data?.items?.length ?? 0;
  const activePlan = plans.data?.items?.find((p) => p.planType === 'STRUCTURED') || plans.data?.items?.[0];
  const hydrationTotalMl = (hydrationLogs.data?.items ?? []).reduce((sum, h) => sum + h.amountMl, 0);

  const todayMeals = (mealLogs.data?.items ?? []).filter(m => {
    if (!m.mealTime) return false;
    return new Date(m.mealTime).toDateString() === new Date().toDateString();
  });
  const todayCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((s, m) => s + (m.protein || 0), 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + (m.carbs || 0), 0);
  const todayFat = todayMeals.reduce((s, m) => s + (m.fat || 0), 0);

  const macroProgress = useMemo(() => {
    if (!macroTargets.data) return null;
    return {
      calories: { current: todayCalories, target: macroTargets.data.calories, unit: 'cal' },
      protein: { current: todayProtein, target: macroTargets.data.protein, unit: 'g' },
      carbs: { current: todayCarbs, target: macroTargets.data.carbs, unit: 'g' },
      fat: { current: todayFat, target: macroTargets.data.fat, unit: 'g' },
    };
  }, [macroTargets.data, todayCalories, todayProtein, todayCarbs, todayFat]);

  const handleLogMeal = useCallback(async () => {
    setLoggingMeal(true);
    try {
      await nutritionApi.logMeal({
        mealType: mealForm.mealType,
        title: mealForm.title || undefined,
        calories: mealForm.calories ? Number(mealForm.calories) : undefined,
        protein: mealForm.protein ? Number(mealForm.protein) : undefined,
        carbs: mealForm.carbs ? Number(mealForm.carbs) : undefined,
        fat: mealForm.fat ? Number(mealForm.fat) : undefined,
      });
      setMealForm({ mealType: 'BREAKFAST', title: '', calories: '', protein: '', carbs: '', fat: '' });
      setShowMealForm(false);
      mealLogs.reload();
    } finally {
      setLoggingMeal(false);
    }
  }, [mealForm, mealLogs]);

  const handleLogHydration = useCallback(async (amountMl: number) => {
    setLoggingHydration(true);
    try {
      await nutritionApi.logHydration(amountMl);
      hydrationLogs.reload();
    } finally {
      setLoggingHydration(false);
    }
  }, [hydrationLogs]);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Nutrition" subtitle="Follow your plan, log meals, and track macro consistency." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { mealLogs.reload(); plans.reload(); hydrationLogs.reload(); }} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-primary"><Apple className="h-5 w-5" /></div>
                      <div><p className="text-sm text-muted-foreground">Meals logged</p><p className="text-2xl font-black">{mealCount}</p></div>
                    </div>
                    <button onClick={() => setShowMealForm(!showMealForm)} className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition" aria-label="Log meal">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Target className="h-5 w-5" /></div>
                    <div><p className="text-sm text-muted-foreground">Active plan</p><p className="text-2xl font-black">{activePlan?.title || 'None'}</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-flow"><Droplets className="h-5 w-5" /></div>
                      <div><p className="text-sm text-muted-foreground">Hydration today</p><p className="text-2xl font-black">{hydrationTotalMl > 0 ? `${Math.round(hydrationTotalMl / 1000 * 10) / 10}L` : '--'}</p></div>
                    </div>
                    <div className="flex gap-1">
                      {[250, 500, 750].map(ml => (
                        <button key={ml} onClick={() => handleLogHydration(ml)} disabled={loggingHydration} className="rounded-lg bg-flow/10 px-2 py-1 text-xs font-bold text-flow hover:bg-flow/20 transition disabled:opacity-50" aria-label={`Add ${ml}ml water`}>
                          +{ml}ml
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {showMealForm && (
              <Card className="mt-4">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black">Log a meal</h3>
                    <button onClick={() => setShowMealForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Meal type</label>
                      <select value={mealForm.mealType} onChange={e => setMealForm(f => ({ ...f, mealType: e.target.value }))} className="w-full rounded-xl border border-border bg-card p-2.5 text-base">
                        {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_LABELS[t]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">What did you eat?</label>
                      <input value={mealForm.title} onChange={e => setMealForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chicken salad" className="w-full rounded-xl border border-border bg-card p-2.5 text-base" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div><label className="text-xs text-muted-foreground">Calories</label><input type="number" min={0} value={mealForm.calories} onChange={e => setMealForm(f => ({ ...f, calories: e.target.value }))} placeholder="kcal" className="w-full rounded-xl border border-border bg-card p-2.5 text-base text-center" /></div>
                    <div><label className="text-xs text-muted-foreground">Protein</label><input type="number" min={0} value={mealForm.protein} onChange={e => setMealForm(f => ({ ...f, protein: e.target.value }))} placeholder="g" className="w-full rounded-xl border border-border bg-card p-2.5 text-base text-center" /></div>
                    <div><label className="text-xs text-muted-foreground">Carbs</label><input type="number" min={0} value={mealForm.carbs} onChange={e => setMealForm(f => ({ ...f, carbs: e.target.value }))} placeholder="g" className="w-full rounded-xl border border-border bg-card p-2.5 text-base text-center" /></div>
                    <div><label className="text-xs text-muted-foreground">Fat</label><input type="number" min={0} value={mealForm.fat} onChange={e => setMealForm(f => ({ ...f, fat: e.target.value }))} placeholder="g" className="w-full rounded-xl border border-border bg-card p-2.5 text-base text-center" /></div>
                  </div>
                  <Button onClick={handleLogMeal} disabled={loggingMeal} className="w-full">
                    {loggingMeal ? <><Loader className="mr-2 h-4 w-4 animate-spin" /> Logging...</> : 'Log meal'}
                  </Button>
                </CardContent>
              </Card>
            )}

{todayMeals.length > 0 && (
               <Card className="mt-4">
                 <CardContent className="p-5">
                   <h3 className="font-black mb-3">Today&apos;s intake</h3>
                   {macroProgress && (
                     <div className="mb-4 space-y-3">
                       {(['calories', 'protein', 'carbs', 'fat'] as const).map(key => {
                         const m = macroProgress[key];
                         const pct = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                         const colorClass = key === 'calories' ? 'bg-primary' : key === 'protein' ? 'bg-flow' : key === 'carbs' ? 'bg-energy' : 'bg-pulse';
                         return (
                           <div key={key}>
                             <div className="flex justify-between text-xs mb-1">
                               <span className="font-bold">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                               <span className="text-muted-foreground">{m.current}/{m.target}{m.unit}</span>
                             </div>
                             <div className="h-2 bg-muted rounded-full overflow-hidden">
                               <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                   <div className="grid grid-cols-4 gap-3 text-center">
                     <div className="rounded-xl bg-muted p-3"><p className="text-lg font-black">{todayCalories}</p><p className="text-xs text-muted-foreground">calories</p></div>
                     <div className="rounded-xl bg-muted p-3"><p className="text-lg font-black text-flow">{todayProtein}g</p><p className="text-xs text-muted-foreground">protein</p></div>
                     <div className="rounded-xl bg-muted p-3"><p className="text-lg font-black text-energy">{todayCarbs}g</p><p className="text-xs text-muted-foreground">carbs</p></div>
                     <div className="rounded-xl bg-muted p-3"><p className="text-lg font-black text-pulse">{todayFat}g</p><p className="text-xs text-muted-foreground">fat</p></div>
                   </div>
                   <div className="mt-3 space-y-1.5">
                     {todayMeals.slice(0, 5).map(m => (
                       <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                         <span className="font-bold">{MEAL_LABELS[m.mealType] || m.mealType}{m.title ? `: ${m.title}` : ''}</span>
                         <span className="text-muted-foreground">{m.calories ? `${m.calories} cal` : ''}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
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
                  <p className="mt-2 text-sm text-muted-foreground">Log meals above to track your daily intake. Your coach can assign a structured plan with meal timing and targets.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
