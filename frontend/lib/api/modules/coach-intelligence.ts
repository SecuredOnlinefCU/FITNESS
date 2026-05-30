import { apiFetch } from '@/lib/api/client';

export const coachIntelligenceApi = {
  attentionQueue() {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/attention-queue');
  },
  refreshAttentionQueue() {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/attention-queue/refresh', { method: 'POST' });
  },
  detectMissedCheckins() {
    return apiFetch<{ items: any[] }>('/api/coach-intelligence/missed-checkins/detect', { method: 'POST' });
  },
  riskFlags(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${encodeURIComponent(clientUserId)}` : '';
    return apiFetch<{ items: any[] }>(`/api/coach-intelligence/risk-flags${query}`);
  },
  resolveRiskFlag(flagId: string) {
    return apiFetch(`/api/coach-intelligence/risk-flags/${flagId}/resolve`, { method: 'POST' });
  },
};
