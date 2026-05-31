import { apiFetch } from '@/lib/api/client';
import type { ApiList, Thread, Message } from '@/lib/types/domain';

export const messagingApi = {
  listThreads() {
    return apiFetch<ApiList<Thread>>('/api/messaging/threads');
  },
  sendMessage(threadId: string, input: { bodyText: string; messageType?: string }) {
    return apiFetch<Message>(`/api/messaging/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
