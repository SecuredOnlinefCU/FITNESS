import { apiFetch } from '@/lib/api/client';
import type { ApiList, Thread, Message } from '@/lib/types/domain';

export const messagingApi = {
  listThreads() {
    return apiFetch<ApiList<Thread>>('/api/messaging/threads');
  },
  listMessages(threadId: string) {
    return apiFetch<ApiList<Message>>(`/api/messaging/threads/${threadId}/messages`);
  },
  sendMessage(threadId: string, input: { bodyText: string; messageType?: string }) {
    return apiFetch<Message>(`/api/messaging/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  markRead(messageId: string) {
    return apiFetch(`/api/messaging/messages/${messageId}/flags`, {
      method: 'PATCH',
      body: JSON.stringify({ flagType: 'READ' }),
    });
  },
};
