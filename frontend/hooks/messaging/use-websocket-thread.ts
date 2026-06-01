'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { messagingApi } from '@/lib/api/modules/messaging';
import { getRealtimeClient, type RealtimeConnectionStatus } from '@/lib/realtime/websocket-client';
import type { MessageDeliveryStatus, ServerRealtimeEvent } from '@/lib/realtime/message-types';
import type { Message } from '@/lib/types/domain';

type LiveMessage = Message & {
  clientMessageId?: string;
  deliveryStatus?: MessageDeliveryStatus;
  durationMs?: number;
};

function clientId() {
  return `lf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useWebSocketThread({
  threadId,
  currentUserId,
  initialMessages = [],
}: {
  threadId: string;
  currentUserId?: string;
  initialMessages?: Message[];
}) {
  const client = useMemo(() => getRealtimeClient(), []);
  const [connectionStatus, setConnectionStatus] = useState<RealtimeConnectionStatus>('idle');
  const [messages, setMessages] = useState<LiveMessage[]>(initialMessages.map((message) => ({ ...message, deliveryStatus: 'delivered' })));
  const [error, setError] = useState<string | null>(null);
  const pendingByClientId = useRef(new Map<string, LiveMessage>());

  useEffect(() => {
    client.connect();
    const offStatus = client.onStatus(setConnectionStatus);
    const offMessage = client.onMessage((event: ServerRealtimeEvent) => {
      if ('threadId' in event && event.threadId !== threadId) return;

      if (event.type === 'thread.joined') return;

      if (event.type === 'message.created') {
        setMessages((existing) => {
          const clientMessageId = event.clientMessageId;
          if (clientMessageId && existing.some((message) => message.clientMessageId === clientMessageId)) {
            return existing.map((message) => message.clientMessageId === clientMessageId
              ? { ...event.message, clientMessageId, deliveryStatus: 'delivered' }
              : message);
          }
          if (existing.some((message) => message.id === event.message.id)) return existing;
          return [...existing, { ...event.message, deliveryStatus: 'delivered' }];
        });
      }

      if (event.type === 'message.delivered') {
        setMessages((existing) => existing.map((message) => {
          if (message.id === event.messageId || message.clientMessageId === event.clientMessageId) {
            return { ...message, deliveryStatus: 'delivered' };
          }
          return message;
        }));
      }

      if (event.type === 'message.read') {
        setMessages((existing) => existing.map((message) => message.id === event.messageId ? { ...message, deliveryStatus: 'read' } : message));
      }

      if (event.type === 'error') {
        setError(event.error);
        if (event.clientMessageId) {
          setMessages((existing) => existing.map((message) => message.clientMessageId === event.clientMessageId ? { ...message, deliveryStatus: 'failed' } : message));
        }
      }
    });

    client.send({ type: 'thread.join', threadId });
    return () => {
      client.send({ type: 'thread.leave', threadId });
      offStatus();
      offMessage();
    };
  }, [client, threadId]);

  const sorted = useMemo(() => [...messages].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))), [messages]);

  const sendText = useCallback(async (bodyText: string) => {
    const clientMessageId = clientId();
    const optimistic: LiveMessage = {
      id: clientMessageId,
      clientMessageId,
      threadId,
      senderUserId: currentUserId || 'me',
      messageType: 'TEXT',
      bodyText,
      createdAt: new Date().toISOString(),
      deliveryStatus: connectionStatus === 'open' ? 'sent' : 'queued',
    };

    pendingByClientId.current.set(clientMessageId, optimistic);
    setMessages((existing) => [...existing, optimistic]);
    setError(null);

    const sentOverSocket = client.send({ type: 'message.send', clientMessageId, threadId, bodyText, messageType: 'TEXT' });
    setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...message, deliveryStatus: sentOverSocket ? 'sent' : 'queued' } : message));

    // HTTP fallback keeps messaging functional if WebSocket is blocked or backend socket is not live yet.
    if (!sentOverSocket) {
      try {
        const saved = await messagingApi.sendMessage(threadId, { messageType: 'TEXT', bodyText });
        setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...saved, clientMessageId, deliveryStatus: 'delivered' } : message));
      } catch (err: any) {
        setError(err?.message || 'Message failed.');
        setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...message, deliveryStatus: 'failed' } : message));
      }
    }
  }, [client, connectionStatus, currentUserId, threadId]);

  const sendMedia = useCallback(async (messageType: 'VOICE' | 'VIDEO', mediaAssetId: string, durationMs?: number, bodyText?: string) => {
    const clientMessageId = clientId();
    const optimistic: LiveMessage = {
      id: clientMessageId,
      clientMessageId,
      threadId,
      senderUserId: currentUserId || 'me',
      messageType,
      mediaAssetId,
      durationMs,
      bodyText,
      createdAt: new Date().toISOString(),
      deliveryStatus: connectionStatus === 'open' ? 'sent' : 'queued',
    };

    pendingByClientId.current.set(clientMessageId, optimistic);
    setMessages((existing) => [...existing, optimistic]);
    setError(null);

    const sentOverSocket = client.send({ type: 'message.send', clientMessageId, threadId, messageType, mediaAssetId, durationMs });
    setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...message, deliveryStatus: sentOverSocket ? 'sent' : 'queued' } : message));

    if (!sentOverSocket) {
      try {
        const saved = await messagingApi.sendMessage(threadId, { messageType, mediaAssetId, durationMs, bodyText });
        setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...saved, clientMessageId, deliveryStatus: 'delivered' } : message));
      } catch (err: any) {
        setError(err?.message || 'Message failed.');
        setMessages((existing) => existing.map((message) => message.clientMessageId === clientMessageId ? { ...message, deliveryStatus: 'failed' } : message));
      }
    }
  }, [client, connectionStatus, currentUserId, threadId]);

  const markRead = useCallback((messageId: string) => {
    client.send({ type: 'message.read', messageId, threadId });
  }, [client, threadId]);

  return {
    messages: sorted,
    connectionStatus,
    error,
    sendText,
    sendMedia,
    markRead,
  };
}
