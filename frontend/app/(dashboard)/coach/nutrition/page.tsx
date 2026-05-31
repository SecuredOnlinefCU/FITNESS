'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { NutritionPlanList } from '@/components/coach/nutrition/nutrition-plan-list';
import { MacroGoalEditor } from '@/components/coach/nutrition/macro-goal-editor';
import { StructuredPlanBuilder } from '@/components/coach/nutrition/structured-plan-builder';
import { MealLogReview } from '@/components/coach/nutrition/meal-log-review';
import { RecipeLibrary } from '@/components/coach/nutrition/recipe-library';
import { ProgressClientSelector } from '@/components/coach/progress/progress-client-selector';
import { Utensils, Plus } from 'lucide-react';
import type { NutritionPlan } from '@/lib/types/domain';

export default function CoachNutritionPage() {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editPlan, setEditPlan] = useState<NutritionPlan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSaved() {
    setEditPlan(null);
    setShowBuilder(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Nutrition planning" subtitle="Create meal plans, set macro targets, and review client meal logs." />

        <div className="mb-5">
          <ProgressClientSelector selectedId={selectedClientId} onChange={setSelectedClientId} />
        </div>

        {selectedClientId ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Meal plans</h2>
              {!showBuilder && (
                <button onClick={() => setShowBuilder(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> New structured plan
                </button>
              )}
            </div>

            {showBuilder || editPlan ? (
              <StructuredPlanBuilder key={refreshKey} clientUserId={selectedClientId} plan={editPlan} onClose={() => { setEditPlan(null); setShowBuilder(false); }} onSaved={handleSaved} />
            ) : (
              <NutritionPlanList key={refreshKey} clientUserId={selectedClientId} onEdit={(p) => setEditPlan(p)} />
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              <MacroGoalEditor clientUserId={selectedClientId} />
              <MealLogReview clientUserId={selectedClientId} />
              <RecipeLibrary />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-muted p-10 text-center">
            <Utensils className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-bold text-muted-foreground">Select a client above</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a client to view their nutrition plans, set macro targets, and review meal logs.</p>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
