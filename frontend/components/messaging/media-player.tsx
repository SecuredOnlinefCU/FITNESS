'use client';

import { Mic, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceMessagePlayer({ mediaAssetId, durationMs, mine }: { mediaAssetId: string; durationMs?: number | null; mine: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', mine ? 'flex-row-reverse' : 'flex-row')}>
      <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
        <Mic className="h-4 w-4 text-primary" />
        <audio src={mediaAssetId} controls className="h-8 w-40" preload="none" />
        {durationMs ? (
          <span className="text-xs tabular-nums text-muted-foreground">{Math.round(durationMs / 1000)}s</span>
        ) : null}
      </div>
    </div>
  );
}

export function VideoMessagePlayer({ mediaAssetId, mine }: { mediaAssetId: string; mine: boolean }) {
  return (
    <div className={cn(mine ? 'flex justify-end' : 'flex justify-start')}>
      <div className="relative max-w-[280px] overflow-hidden rounded-2xl">
        <video src={mediaAssetId} controls className="w-full rounded-2xl" preload="metadata" />
        <div className="absolute bottom-2 right-2 rounded-full bg-black/60 p-1">
          <Video className="h-3 w-3 text-white" />
        </div>
      </div>
    </div>
  );
}

export function ImageMessageView({ mediaAssetId, mine }: { mediaAssetId: string; mine: boolean }) {
  return (
    <div className={cn(mine ? 'flex justify-end' : 'flex justify-start')}>
      <img src={mediaAssetId} alt="Shared image" className="max-w-[240px] rounded-2xl object-cover" />
    </div>
  );
}
