'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { feedApi } from '@/lib/api/modules/feed';
import type { FeedComment } from '@/lib/types/domain';
import { Button } from '@/components/ui/button';

export function CommentSection({
  postId,
  count,
  onCommentAdded,
}: {
  postId: string;
  count: number;
  onCommentAdded: (postId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (comments.length > 0) return;
    setLoading(true);
    try {
      const res = await feedApi.listComments(postId);
      setComments(res.items);
    } catch {
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!bodyText.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await feedApi.addComment(postId, bodyText.trim());
      setBodyText('');
      const res = await feedApi.listComments(postId);
      setComments(res.items);
      onCommentAdded(postId);
    } catch {
      setError('Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button onClick={toggleOpen} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition">
        <MessageSquare className="h-4 w-4" />
        {count > 0 && <span>{count}</span>}
        <span>{open ? 'Hide' : 'Comment'}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="text-sm">
                <span className="font-bold text-foreground">{c.author?.firstName ?? 'User'} {c.author?.lastName ?? ''}</span>
                <span className="text-muted-foreground"> — {c.bodyText}</span>
              </div>
            ))
          )}

          {error && <p className="text-sm text-pulse">{error}</p>}

          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write a comment..."
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            />
            <Button variant="secondary" onClick={handleSubmit} disabled={submitting || !bodyText.trim()}>
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
