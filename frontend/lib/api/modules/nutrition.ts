import { apiFetch } from '@/lib/api/client';
import type { ApiList, HydrationLog, MealLog } from '@/lib/types/domain';

type NutritionPlanItem = {
  id: string;
  coachUserId: string;
  clientUserId?: string;
  title: string;
  description?: string | null;
  days?: unknown[];
};

export const nutritionApi = {
  listPlans(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<NutritionPlanItem>>(`/api/nutrition/plans${query}`);
  },
  createPlan(input: { clientUserId: string; planType: string; title: string }) {
    return apiFetch<NutritionPlanItem>('/api/nutrition/plans', { method: 'POST', body: JSON.stringify(input) });
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
    return apiFetch<{ items: { id: string; name: string; email: string }[] }>('/api/training/coach-clients');
  },
  getHydration() {
    return apiFetch<ApiList<HydrationLog>>('/api/nutrition/hydration');
  },
};
