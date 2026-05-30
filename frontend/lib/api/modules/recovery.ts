import { apiFetch } from '@/lib/api/client';

export const recoveryApi = {
  today() { return apiFetch<{ items: any[] }>('/api/recovery/today'); },
  history(days = 30) { return apiFetch<{ items: any[] }>(`/api/recovery/history?days=${days}`); },
  upsertMetric(input: any) { return apiFetch('/api/recovery/metrics', { method: 'POST', body: JSON.stringify(input) }); },
};
