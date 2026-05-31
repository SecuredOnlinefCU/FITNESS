import { apiFetch } from '@/lib/api/client';
import type { ApiList, HydrationLog, MealLog, NutritionPlan, NutritionDay, NutritionMeal } from '@/lib/types/domain';

export const nutritionApi = {
  listPlans(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<NutritionPlan>>(`/api/nutrition/plans${query}`);
  },
  getPlan(id: string) {
    return apiFetch<NutritionPlan>(`/api/nutrition/plans/${id}`);
  },
  createPlan(input: { clientUserId: string; planType: string; title: string; notes?: string; startDate?: string; endDate?: string }) {
    return apiFetch<NutritionPlan>('/api/nutrition/plans', { method: 'POST', body: JSON.stringify(input) });
  },
  updatePlan(id: string, input: { title?: string; planType?: string; notes?: string; startDate?: string; endDate?: string }) {
    return apiFetch<NutritionPlan>(`/api/nutrition/plans/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deletePlan(id: string) {
    return apiFetch<void>(`/api/nutrition/plans/${id}`, { method: 'DELETE' });
  },
  addPlanDay(planId: string, dayIndex: number) {
    return apiFetch<NutritionDay>(`/api/nutrition/plans/${planId}/days`, { method: 'POST', body: JSON.stringify({ dayIndex }) });
  },
  deletePlanDay(planId: string, dayId: string) {
    return apiFetch<void>(`/api/nutrition/plans/${planId}/days/${dayId}`, { method: 'DELETE' });
  },
  addDayMeal(dayId: string, input: { mealType: string; title?: string; instructions?: string; calories?: number; protein?: number; carbs?: number; fat?: number }) {
    return apiFetch<NutritionMeal>(`/api/nutrition/days/${dayId}/meals`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateMeal(mealId: string, input: { mealType?: string; title?: string; instructions?: string; calories?: number; protein?: number; carbs?: number; fat?: number }) {
    return apiFetch<NutritionMeal>(`/api/nutrition/meals/${mealId}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteMeal(mealId: string) {
    return apiFetch<void>(`/api/nutrition/meals/${mealId}`, { method: 'DELETE' });
  },
  listMealLogs(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<MealLog>>(`/api/nutrition/meal-logs${query}`);
  },
  listRecipes() {
    return apiFetch<ApiList<unknown>>('/api/nutrition/recipes');
  },
  createRecipe(input: { title: string; instructions?: string }) {
    return apiFetch<unknown>('/api/nutrition/recipes', { method: 'POST', body: JSON.stringify(input) });
  },
  listCoachClients() {
    return apiFetch<{ items: { id: string; firstName: string; lastName: string; email: string }[] }>('/api/training/coach-clients');
  },
  getHydration() {
    return apiFetch<ApiList<HydrationLog>>('/api/nutrition/hydration');
  },
};
