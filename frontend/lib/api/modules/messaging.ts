import { apiFetch } from '@/lib/api/client';

export const messagingApi = {
  listThreads() {
    return apiFetch<{ items: any[] }>('/api/messaging/threads');
  },
};
