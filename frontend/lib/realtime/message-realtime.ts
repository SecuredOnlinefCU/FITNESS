export type RealtimeMessageEvent = {
  type: 'message.created' | 'message.updated' | 'message.deleted';
  threadId: string;
  payload: any;
};

export type RealtimeUnsubscribe = () => void;

export function subscribeToThreadMessages(
  threadId: string,
  onEvent: (event: RealtimeMessageEvent) => void,
): RealtimeUnsubscribe {
  // Placeholder adapter.
  // Replace with WebSocket or SSE when backend exposes `/api/messaging/threads/:threadId/events`.
  // For now, polling hooks provide near-real-time updates.
  void threadId;
  void onEvent;
  return () => {};
}
