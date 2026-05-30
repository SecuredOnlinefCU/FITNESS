'use client';

import { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function OptimisticMessageComposer({ onSend, status }: { onSend: (bodyText: string) => Promise<void> | void; status?: string }) {
  const [bodyText, setBodyText] = useState('');

  async function submit() {
    if (!bodyText.trim()) return;
    const next = bodyText;
    setBodyText('');
    await onSend(next);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div className="flex gap-2">
        <Button variant="secondary" type="button" aria-label="Attach media">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          placeholder="Write a message..."
          onKeyDown={(event) => event.key === 'Enter' && submit()}
        />
        <Button type="button" onClick={submit} disabled={!bodyText.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {status ? <p className="mt-2 text-xs text-slate-500">{status}</p> : null}
    </div>
  );
}
