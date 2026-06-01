'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { messagingApi } from '@/lib/api/modules/messaging';
import { subscribeToThreadMessages } from '@/lib/realtime/message-realtime';
import type { Message } from '@/lib/types/domain';

type OptimisticMessage = Message & {
  optimistic?: boolean;
  failed?: boolean;
};

export function useOptimisticThread({
  threadId,
  currentUserId,
  initialMessages = [],
  refreshIntervalMs = 8000,
}: {
  threadId: string;
  currentUserId?: string;
  initialMessages?: Message[];
  refreshIntervalMs?: number;
}) {
  const [messages, setMessages] = useState<OptimisticMessage[]>(
    initialMessages?.map(m => ({ ...m, durationMs: m.durationMs ?? undefined })) ?? []
  );
  const [status, setStatus] = useState('');

  const sorted = useMemo(
    () => [...messages].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))),
    [messages],
  );

  const refresh = useCallback(async () => {
    // Current backend package needs a thread-detail endpoint for true history reload.
    // This hook keeps the adapter boundary ready and does not break without it.
    setStatus((current) => current === 'Sending...' ? current : '');
  }, []);

  useEffect(() => {
    const unsub = subscribeToThreadMessages(threadId, (event) => {
      if (event.type === 'message.created') {
        setMessages((existing) => {
          if (existing.some((message) => message.id === event.payload.id)) return existing;
          return [...existing, event.payload];
        });
      }
    });

    const timer = window.setInterval(refresh, refreshIntervalMs);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, [threadId, refresh, refreshIntervalMs]);

  async function sendText(bodyText: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: OptimisticMessage = {
      id: tempId,
      threadId,
      senderUserId: currentUserId || 'me',
      messageType: 'TEXT',
      bodyText,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((existing) => [...existing, optimistic]);
    setStatus('Sending...');

    try {
      const saved = await messagingApi.sendMessage(threadId, { messageType: 'TEXT', bodyText });
      setMessages((existing) => existing.map((message) => message.id === tempId ? saved : message));
      setStatus('');
    } catch (error: any) {
      setMessages((existing) => existing.map((message) => message.id === tempId ? { ...message, failed: true, optimistic: false } : message));
      setStatus(error.message || 'Message failed.');
    }
  }

  async function sendMedia(messageType: 'VOICE' | 'VIDEO', mediaAssetId: string, durationMs?: number, bodyText?: string) {
    const tempId = `temp-${Date.now()}`;
    const optimistic: OptimisticMessage = {
      id: tempId,
      threadId,
      senderUserId: currentUserId || 'me',
      messageType,
      mediaAssetId,
      durationMs,
      bodyText,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((existing) => [...existing, optimistic]);
    setStatus('Sending...');

    try {
      const saved = await messagingApi.sendMessage(threadId, { messageType, mediaAssetId, durationMs, bodyText });
      setMessages((existing) => existing.map((message) => message.id === tempId ? saved : message));
      setStatus('');
    } catch (error: any) {
      setMessages((existing) => existing.map((message) => message.id === tempId ? { ...message, failed: true, optimistic: false } : message));
      setStatus(error.message || 'Message failed.');
    }
  }

  return {
    messages: sorted,
    status,
    sendText,
    sendMedia,
    refresh,
  };
}
