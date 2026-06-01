'use client';

import { useWebSocketThread } from '@/hooks/messaging/use-websocket-thread';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DeliveryStatus } from './delivery-status';
import { WebSocketStatusPill } from './websocket-status-pill';
import { OptimisticMessageComposer } from './optimistic-message-composer';
import { VoiceMessagePlayer, VideoMessagePlayer, ImageMessageView } from '../media-player';
import type { Message } from '@/lib/types/domain';

function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] space-y-2 rounded-2xl px-4 py-3 text-sm shadow-sm',
        mine ? 'bg-primary text-primary-foreground' : 'border border-border bg-card',
        (message as any).deliveryStatus === 'failed' ? 'border-red-300 bg-red-50 text-red-700' : '',
      )}>
        {message.messageType === 'VOICE' ? (
          <VoiceMessagePlayer mediaAssetId={message.mediaAssetId || ''} durationMs={(message as any).durationMs} mine={mine} />
        ) : message.messageType === 'VIDEO' ? (
          <VideoMessagePlayer mediaAssetId={message.mediaAssetId || ''} mine={mine} />
        ) : message.messageType === 'IMAGE' ? (
          <ImageMessageView mediaAssetId={message.mediaAssetId || ''} mine={mine} />
        ) : (
          <p>{message.bodyText || `[${message.messageType}]`}</p>
        )}
        <div className={cn('flex justify-end', mine ? 'text-white/75' : 'text-muted-foreground')}>
          <DeliveryStatus status={(message as any).deliveryStatus} />
        </div>
      </div>
    </div>
  );
}

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
          {thread.messages.length ? thread.messages.map((message: any) => (
            <MessageBubble key={message.clientMessageId || message.id} message={message} mine={message.senderUserId === currentUserId || message.senderUserId === 'me'} />
          )) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</div>
          )}
        </div>

        {thread.error ? <p className="mt-2 text-xs text-pulse">{thread.error}</p> : null}

        <div className="mt-4">
          <OptimisticMessageComposer onSend={thread.sendText} onSendMedia={thread.sendMedia} />
        </div>
      </CardContent>
    </Card>
  );
}
