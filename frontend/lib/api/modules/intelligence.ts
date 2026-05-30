import { apiFetch } from '@/lib/api/client';

export const intelligenceApi = {
  getToday() {
    return apiFetch<{ snapshot: any; recommendations: any[]; completionScore: number }>('/api/intelligence/today');
  },
  completeRecommendation(recommendationId: string) {
    return apiFetch(`/api/intelligence/today/recommendations/${recommendationId}/complete`, { method: 'POST' });
  },
};
