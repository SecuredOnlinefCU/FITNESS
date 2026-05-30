import { apiFetch } from '@/lib/api/client';

export const clientHealthApi = {
  scores() {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/client-health/scores');
  },
  refreshScores() {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/client-health/scores/refresh', { method: 'POST' });
  },
  detail(clientUserId: string) {
    return apiFetch(`/api/coach-intelligence/client-health/clients/${clientUserId}`);
  },
  generateRecommendations(clientUserId?: string) {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/client-health/recommendations/generate', { method: 'POST', body: JSON.stringify({ clientUserId }) });
  },
  completeRecommendation(recommendationId: string) {
    return apiFetch(`/api/coach-intelligence/client-health/recommendations/${recommendationId}/complete`, { method: 'POST' });
  },
};
