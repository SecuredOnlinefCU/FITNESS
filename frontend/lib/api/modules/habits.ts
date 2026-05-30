import { apiFetch } from '@/lib/api/client';

export const habitsApi = {
  listHabits() {
    return apiFetch<{ items: any[] }>('/api/habits');
  },
  createHabit(input: { title: string; description?: string; programId?: string; cadence?: string; targetCount?: number }) {
    return apiFetch('/api/habits', { method: 'POST', body: JSON.stringify(input) });
  },
  logHabit(habitDefinitionId: string, notes?: string) {
    return apiFetch(`/api/habits/${habitDefinitionId}/logs`, { method: 'POST', body: JSON.stringify({ notes }) });
  },
  listMyLogs() {
    return apiFetch<{ items: any[] }>('/api/habits/logs/me');
  },
};
