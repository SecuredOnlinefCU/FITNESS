import { apiFetch } from '@/lib/api/client';

export const workoutWarningsApi = {
  generate() { return apiFetch<{ items: any[] }>('/api/coach-intelligence/workout-warnings/generate', { method: 'POST' }); },
  list(clientUserId?: string) { const q = clientUserId ? `?clientUserId=${encodeURIComponent(clientUserId)}` : ''; return apiFetch<{ items: any[] }>(`/api/coach-intelligence/workout-warnings${q}`); },
  resolve(warningId: string) { return apiFetch(`/api/coach-intelligence/workout-warnings/${warningId}/resolve`, { method: 'POST' }); },
};
