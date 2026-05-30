'use client';

import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { useWebSocketThread } from '@/hooks/messaging/use-websocket-thread';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DeliveryStatus } from './delivery-status';
import { WebSocketStatusPill } from './websocket-status-pill';
import type { Message } from '@/lib/types/domain';

export function LiveThreadView({
  threadId,
  currentUserId,
  initialMessages = [],
}: {
  threadId: string;
  currentUserId?: string;
  initialMessages?: Message[];
}) {
  const thread = useWebSocketThread({ threadId, currentUserId, initialMessages });
  const [bodyText, setBodyText] = useState('');

  async function submit() {
    if (!bodyText.trim()) return;
    const next = bodyText;
    setBodyText('');
    await thread.sendText(next);
  }

  return (
    <Card>
      <CardContent className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col p-4">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="font-black">Live conversation</h2>
            <p className="text-sm text-muted-foreground">WebSocket-first messaging with HTTP fallback and delivery states.</p>
          </div>
          <WebSocketStatusPill status={thread.connectionStatus} />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-muted/40 p-4">
          {thread.messages.length ? thread.messages.map((message: any) => {
            const mine = message.senderUserId === currentUserId || message.senderUserId === 'me';
            return (
              <div key={message.clientMessageId || message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm', mine ? 'bg-primary text-primary-foreground' : 'border border-border bg-card', message.deliveryStatus === 'failed' ? 'border-red-300 bg-red-50 text-red-700' : '')}>
                  <p>{message.bodyText || `[${message.messageType}]`}</p>
                  <div className={cn('mt-1 flex justify-end', mine ? 'text-white/75' : 'text-muted-foreground')}>
                    <DeliveryStatus status={message.deliveryStatus} />
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</div>
          )}
        </div>

        {thread.error ? <p className="mt-2 text-xs text-red-600">{thread.error}</p> : null}

        <div className="mt-4 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="flex gap-2">
            <Button variant="secondary" type="button" aria-label="Attach media"><Paperclip className="h-4 w-4" /></Button>
            <Input value={bodyText} onChange={(event) => setBodyText(event.target.value)} placeholder="Write a message..." onKeyDown={(event) => event.key === 'Enter' && submit()} />
            <Button type="button" onClick={submit} disabled={!bodyText.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
