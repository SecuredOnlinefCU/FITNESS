'use client';

import { Bookmark } from 'lucide-react';
import { feedApi } from '@/lib/api/modules/feed';

export function SaveButton({
  postId,
  hasSaved,
  onToggle,
}: {
  postId: string;
  hasSaved: boolean;
  onToggle: (postId: string) => void;
}) {
  async function handleClick() {
    onToggle(postId);
    try {
      if (hasSaved) {
        await feedApi.unsavePost(postId);
      } else {
        await feedApi.savePost(postId);
      }
    } catch {
      onToggle(postId);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition ${
        hasSaved ? 'bg-flow/10 text-flow' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <Bookmark className={`h-4 w-4 ${hasSaved ? 'fill-flow' : ''}`} />
    </button>
  );
}
