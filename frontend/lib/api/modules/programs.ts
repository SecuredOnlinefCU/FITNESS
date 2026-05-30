import { apiFetch } from '@/lib/api/client';

export const programsApi = {
  createProgram(input: { name: string; description?: string }) {
    return apiFetch('/api/programs', { method: 'POST', body: JSON.stringify(input) });
  },
  listPrograms() {
    return apiFetch<{ items: any[] }>('/api/programs');
  },
};
