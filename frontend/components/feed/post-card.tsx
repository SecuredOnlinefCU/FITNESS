'use client';

import { MoreHorizontal, Edit3, Trash2, Eye, EyeOff, Trophy, Bell, Activity, Heart, Dumbbell, Swords, Apple, TrendingUp, MessageSquare, Play } from 'lucide-react';
import type { FeedPost, FeedPostType, PostAnalytics } from '@/lib/types/domain';
import { ReactionButton } from '@/components/feed/reaction-button';
import { SaveButton } from '@/components/feed/save-button';
import { CommentSection } from '@/components/feed/comment-section';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

function timeAgo(date: string | undefined): string {
  if (!date) return '';
  const now = Date.now();
  const ms = now - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

const typeConfig: Record<FeedPostType, { label: string; icon: React.ReactNode; color: string }> = {
  COACH_MESSAGE: { label: 'Coach', icon: <MessageSquare className="h-3 w-3" />, color: 'bg-primary/10 text-primary' },
  MILESTONE: { label: 'Milestone', icon: <Trophy className="h-3 w-3" />, color: 'bg-energy/10 text-energy' },
  CHECK_IN_PROMPT: { label: 'Check-in', icon: <Bell className="h-3 w-3" />, color: 'bg-flow/10 text-flow' },
  RECOVERY_ALERT: { label: 'Recovery', icon: <Heart className="h-3 w-3" />, color: 'bg-pulse/10 text-pulse' },
  WORKOUT_ASSIGNED: { label: 'Workout', icon: <Dumbbell className="h-3 w-3" />, color: 'bg-signal/10 text-signal' },
  CHALLENGE_UPDATE: { label: 'Challenge', icon: <Swords className="h-3 w-3" />, color: 'bg-energy/10 text-energy' },
  NUTRITION_HACK: { label: 'Nutrition', icon: <Apple className="h-3 w-3" />, color: 'bg-signal/10 text-signal' },
  PROGRESS_SPOTLIGHT: { label: 'Progress', icon: <TrendingUp className="h-3 w-3" />, color: 'bg-flow/10 text-flow' },
};

export function PostCard({
  post,
  isOwner,
  showAnalytics,
  analytics,
  onReactionToggle,
  onSaveToggle,
  onCommentAdded,
  onEdit,
  onDelete,
  onHide,
  onActionClick,
}: {
  post: FeedPost;
  isOwner?: boolean;
  showAnalytics?: boolean;
  analytics?: PostAnalytics | null;
  onReactionToggle: (postId: string) => void;
  onSaveToggle: (postId: string) => void;
  onCommentAdded: (postId: string) => void;
  onEdit?: (post: FeedPost) => void;
  onDelete?: (postId: string) => void;
  onHide?: (postId: string, currentStatus: string | null | undefined) => void;
  onActionClick?: (action: NonNullable<FeedPost['primaryAction']>) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const tagColor: Record<string, string> = {
    ANNOUNCEMENT: 'bg-signal/10 text-signal',
    WIN: 'bg-flow/10 text-flow',
    TIP: 'bg-energy/10 text-energy',
    QUESTION: 'bg-pulse/10 text-pulse',
  };
  const cfg = typeConfig[post.type ?? 'COACH_MESSAGE'];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {post.author?.firstName?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {post.author?.firstName ?? 'Unknown'} {post.author?.lastName ?? ''}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {cfg && (
              <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                {cfg.icon}{cfg.label}
              </span>
            )}
            {post.tag && (
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tagColor[post.tag] ?? 'bg-muted text-muted-foreground'}`}>
                {post.tag}
              </span>
            )}
            {isOwner && (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted transition">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-xl border border-border bg-card p-1 shadow-lg">
                    {onEdit && (
                      <button onClick={() => { setMenuOpen(false); onEdit(post); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                    )}
                    {onHide && (
                      <button onClick={() => { setMenuOpen(false); onHide(post.id, post.status); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">
                        {post.status === 'HIDDEN' ? <><Eye className="h-4 w-4" /> Unhide</> : <><EyeOff className="h-4 w-4" /> Hide</>}
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => { setMenuOpen(false); onDelete(post.id); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-pulse hover:bg-pulse/5">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {post.bodyText && <p className="mt-3 text-sm text-foreground whitespace-pre-wrap">{post.bodyText}</p>}

        {post.media && post.media.length > 0 && (
          <div className={`mt-3 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
            {post.media.slice(0, 4).map(m => (
              m.mimeType?.startsWith('image/') ? (
                <img key={m.id} src={m.cdnUrl ?? ''} alt="" className="w-full rounded-xl object-cover aspect-video" loading="lazy" />
              ) : m.mimeType?.startsWith('video/') ? (
                <button key={m.id} onClick={() => setPlayingVideo(m.cdnUrl ?? '')} className="relative group w-full aspect-video rounded-xl overflow-hidden bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                  </div>
                  {m.thumbnailUrl ? (
                    <img src={m.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Play className="h-8 w-8" />
                    </div>
                  )}
                </button>
              ) : null
            ))}
          </div>
        )}

        {post.primaryAction && (
          <div className="mt-3">
            <Button onClick={() => onActionClick?.(post.primaryAction!)}>
              {post.primaryAction.label}
            </Button>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1">
          <ReactionButton postId={post.id} count={post._count?.reactions ?? 0} hasReacted={post.currentUserReacted ?? false} onToggle={onReactionToggle} />
          <CommentSection postId={post.id} count={post._count?.comments ?? 0} onCommentAdded={onCommentAdded} />
          <SaveButton postId={post.id} hasSaved={post.currentUserSaved ?? false} onToggle={onSaveToggle} />
        </div>

        {playingVideo && (
          <VideoPlayerModal videoUrl={playingVideo} onClose={() => setPlayingVideo(null)} />
        )}

        {showAnalytics && analytics && (
          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span>{analytics.views} views</span>
            <span>{analytics.reactions} reactions</span>
            <span>{analytics.comments} comments</span>
            <span>{analytics.saves} saves</span>
            <span className="font-semibold text-foreground">{analytics.engagementRate}% eng.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
