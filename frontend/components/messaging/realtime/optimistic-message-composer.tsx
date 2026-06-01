'use client';

import { useState } from 'react';
import { Send, Mic, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AudioRecorder } from '../audio-recorder';
import { VideoRecorder } from '../video-recorder';

export function OptimisticMessageComposer({
  onSend,
  onSendMedia,
  status,
}: {
  onSend: (bodyText: string) => Promise<void> | void;
  onSendMedia?: (messageType: 'VOICE' | 'VIDEO', mediaAssetId: string, durationMs?: number) => Promise<void> | void;
  status?: string;
}) {
  const [bodyText, setBodyText] = useState('');

  async function submit() {
    if (!bodyText.trim()) return;
    const next = bodyText;
    setBodyText('');
    await onSend(next);
  }

  if (!onSendMedia) {
    return (
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex gap-2">
          <Input
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Write a message..."
          />
          <Button type="button" onClick={submit} disabled={!bodyText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {status ? <p className="mt-2 text-xs text-muted-foreground">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex gap-2">
          <Input
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Write a message..."
          />
          <Button type="button" onClick={submit} disabled={!bodyText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {status ? <p className="mt-2 text-xs text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );
}
