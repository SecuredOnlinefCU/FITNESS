import { apiFetch } from '@/lib/api/client';
import type { TodayIntelligence } from '@/lib/types/domain';

export const intelligenceApi = {
  getToday() {
    return apiFetch<TodayIntelligence>('/api/intelligence/today');
  },
  completeRecommendation(recommendationId: string) {
    return apiFetch<{ success: boolean }>(`/api/intelligence/today/recommendations/${recommendationId}/complete`, { method: 'POST' });
  },
};
