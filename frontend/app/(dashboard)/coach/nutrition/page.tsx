'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { NutritionPlanList } from '@/components/coach/nutrition/nutrition-plan-list';
import { MacroGoalEditor } from '@/components/coach/nutrition/macro-goal-editor';
import { MealLogReview } from '@/components/coach/nutrition/meal-log-review';
import { RecipeLibrary } from '@/components/coach/nutrition/recipe-library';
import { ProgressClientSelector } from '@/components/coach/progress/progress-client-selector';
import { Utensils } from 'lucide-react';

export default function CoachNutritionPage() {
  const [selectedClientId, setSelectedClientId] = useState('');

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Nutrition planning" subtitle="Create meal plans, set macro targets, and review client meal logs." />

        <div className="mb-5">
          <ProgressClientSelector selectedId={selectedClientId} onChange={setSelectedClientId} />
        </div>

        {selectedClientId ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <NutritionPlanList clientUserId={selectedClientId} />
            <MacroGoalEditor clientUserId={selectedClientId} />
            <MealLogReview clientUserId={selectedClientId} />
            <RecipeLibrary />
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
