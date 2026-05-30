'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useOptimisticThread } from '@/hooks/messaging/use-optimistic-thread';
import { OptimisticMessageComposer } from './optimistic-message-composer';
import type { Message } from '@/lib/types/domain';

export function OptimisticThreadView({
  threadId,
  currentUserId,
  initialMessages = [],
}: {
  threadId: string;
  currentUserId?: string;
  initialMessages?: Message[];
}) {
  const thread = useOptimisticThread({ threadId, currentUserId, initialMessages });

  return (
    <Card>
      <CardContent className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col p-4">
        <div className="mb-4 border-b border-border pb-4">
          <h2 className="font-black">Conversation</h2>
          <p className="text-sm text-slate-500">Optimistic sending is enabled. Messages appear immediately while the backend saves them.</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-muted/40 p-4">
          {thread.messages.length ? thread.messages.map((message: any) => {
            const mine = message.senderUserId === currentUserId || message.senderUserId === 'me';
            return (
              <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm', mine ? 'bg-primary text-primaryForeground' : 'border border-border bg-white', message.failed ? 'border-red-300 bg-red-50 text-red-700' : '')}>
                  <p>{message.bodyText}</p>
                  <p className={cn('mt-1 text-[11px]', mine ? 'text-white/70' : 'text-slate-400')}>
                    {message.failed ? 'Failed to send' : message.optimistic ? 'Sending...' : 'Sent'}
                  </p>
                </div>
              </div>
            );
          }) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">No messages yet. Start the conversation below.</div>
          )}
        </div>

        <div className="mt-4">
          <OptimisticMessageComposer onSend={thread.sendText} status={thread.status} />
        </div>
      </CardContent>
    </Card>
  );
}
