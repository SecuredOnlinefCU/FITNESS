import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

export const messagingApi = {
  listThreads() {
    return apiFetch<ApiList<any>>('/api/messaging/threads');
  },
  sendMessage(threadId: string, input: { bodyText: string; messageType?: string }) {
    return apiFetch<any>(`/api/messaging/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
