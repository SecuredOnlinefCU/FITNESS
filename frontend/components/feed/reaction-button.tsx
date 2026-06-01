'use client';

import { Heart } from 'lucide-react';
import { feedApi } from '@/lib/api/modules/feed';

export function ReactionButton({
  postId,
  count,
  hasReacted,
  onToggle,
}: {
  postId: string;
  count: number;
  hasReacted: boolean;
  onToggle: (postId: string) => void;
}) {
  async function handleClick() {
    onToggle(postId);
    try {
      if (hasReacted) {
        await feedApi.deleteReaction(postId);
      } else {
        await feedApi.upsertReaction(postId);
      }
    } catch {
      onToggle(postId);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition ${
        hasReacted ? 'bg-pulse/10 text-pulse' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <Heart className={`h-4 w-4 ${hasReacted ? 'fill-pulse' : ''}`} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
