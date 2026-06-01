import { apiFetch } from '@/lib/api/client';
import type { AnalyticsSummary } from '@/lib/types/domain';

export const analyticsApi = {
  summary: () => apiFetch<AnalyticsSummary>('/api/analytics/summary'),
  clearCache: () => apiFetch<{ cleared: boolean }>('/api/analytics/cache/clear', { method: 'POST' }),
};
