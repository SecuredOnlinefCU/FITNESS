'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { feedApi } from '@/lib/api/modules/feed';
import { programsApi } from '@/lib/api/modules/programs';
import type { FeedPost, FeedPostType, PostAnalytics } from '@/lib/types/domain';
import { PostCard } from '@/components/feed/post-card';
import { CreatePostDialog } from '@/components/feed/create-post-dialog';
import { SmartNudgeList } from '@/components/feed/smart-nudge-list';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const typeTabs: { value: FeedPostType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'COACH_MESSAGE', label: 'Messages' },
  { value: 'WORKOUT_ASSIGNED', label: 'Workouts' },
  { value: 'MILESTONE', label: 'Milestones' },
  { value: 'CHECK_IN_PROMPT', label: 'Check-ins' },
  { value: 'RECOVERY_ALERT', label: 'Recovery' },
  { value: 'NUTRITION_HACK', label: 'Nutrition' },
  { value: 'CHALLENGE_UPDATE', label: 'Challenges' },
  { value: 'PROGRESS_SPOTLIGHT', label: 'Progress' },
];

export default function CoachFeedPage() {
  const { user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<FeedPostType | 'ALL'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, PostAnalytics>>({});

  const programs = useAsyncData(() => programsApi.listPrograms());
  const programId = (programs.data?.items?.[0] as { program?: { id: string } } | undefined)?.program?.id;
  const posts = useAsyncData(
    () => programId ? feedApi.listProgramPosts(programId, typeFilter === 'ALL' ? undefined : typeFilter) : Promise.resolve({ items: [] }),
    [programId, typeFilter]
  );
  const nudges = useAsyncData(() => feedApi.getNudges(), []);
  const analytics = useAsyncData(
    async () => {
      if (!posts.data?.items) return {};
      const entries = await Promise.all(posts.data.items.map(async (p: FeedPost) => {
        try {
          const a = await feedApi.getPostAnalytics(p.id);
          return [p.id, a] as const;
        } catch { return [p.id, null] as const; }
      }));
      return Object.fromEntries(entries.filter(([, v]) => v !== null)) as Record<string, PostAnalytics>;
    },
    [posts.data?.items?.length]
  );

  useEffect(() => {
    if (analytics.data) setAnalyticsMap(analytics.data);
  }, [analytics.data]);

  function handleReactionToggle(postId: string) {
    const p = posts.data?.items.find((x: FeedPost) => x.id === postId);
    if (!p) return;
    const toggle = p.currentUserReacted ? feedApi.deleteReaction(postId) : feedApi.upsertReaction(postId);
    toggle.then(() => posts.reload()).catch(() => toast.error('Failed to update reaction'));
  }

  function handleSaveToggle(postId: string) {
    const p = posts.data?.items.find((x: FeedPost) => x.id === postId);
    if (!p) return;
    const toggle = p.currentUserSaved ? feedApi.unsavePost(postId) : feedApi.savePost(postId);
    toggle.then(() => posts.reload()).catch(() => toast.error('Failed to save post'));
  }

  function handleCommentAdded(postId: string) {
    posts.reload();
  }

  function handleHide(postId: string, currentStatus: string | null | undefined) {
    feedApi.updatePost(postId, { status: currentStatus === 'HIDDEN' ? 'ACTIVE' : 'HIDDEN' }).then(() => posts.reload()).catch(() => toast.error('Failed to update post'));
  }

  function handleDelete(postId: string) {
    feedApi.deletePost(postId).then(() => posts.reload()).catch(() => toast.error('Failed to delete post'));
  }

  function handleEdit(post: FeedPost) {
    setEditingPost(post);
  }

  async function handleSaveEdit() {
    if (!editingPost) return;
    await feedApi.updatePost(editingPost.id, { bodyText: editingPost.bodyText ?? undefined, tag: editingPost.tag ?? undefined });
    setEditingPost(null);
    posts.reload();
  }

  function handleActionClick(action: NonNullable<FeedPost['primaryAction']>) {
    if (action.href) window.location.href = action.href;
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Feed" subtitle="Create and manage posts for your clients." actionLabel={programId ? 'New post' : undefined} onAction={programId ? () => setShowCreate(true) : undefined} />

        {!programId && programs.loading ? (
          <CardSkeleton />
        ) : !programId ? (
          <div className="mx-auto max-w-lg text-center">
            <EmptyState title="No program yet" description="Create a program first so you can share posts with your clients." />
          </div>
        ) : posts.loading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : posts.error ? (
          <ErrorState message={posts.error} onRetry={() => posts.reload()} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">

      {nudges.data?.items && nudges.data.items.length > 0 && (
        <SmartNudgeList nudges={nudges.data.items} />
      )}

      <div className="flex flex-wrap gap-2">
        {typeTabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              typeFilter === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(!posts.data?.items || posts.data.items.length === 0) ? (
        <EmptyState title="No posts yet" description="Create a post to engage with your clients." />
      ) : (
        <div className="space-y-4">
          {posts.data.items.map(post => (
            <PostCard
              key={post.id}
              post={post}
              isOwner={true}
              showAnalytics={true}
              analytics={analyticsMap[post.id] ?? null}
              onReactionToggle={handleReactionToggle}
              onSaveToggle={handleSaveToggle}
              onCommentAdded={handleCommentAdded}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onHide={handleHide}
              onActionClick={handleActionClick}
            />
          ))}
        </div>
      )}

      {showCreate && programId && (
        <CreatePostDialog programId={programId} onClose={() => setShowCreate(false)} onCreated={() => posts.reload()} />
      )}

      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingPost(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black">Edit post</h2>
            <textarea
              className="mt-3 w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              value={editingPost.bodyText ?? ''}
              onChange={e => setEditingPost({ ...editingPost, bodyText: e.target.value })}
            />
            <input
              className="mt-3 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={editingPost.tag ?? ''}
              onChange={e => setEditingPost({ ...editingPost, tag: e.target.value })}
              placeholder="Tag"
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingPost(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </div>
          </div>
        </div>
      )}
            </div>
          )}
        </DashboardShell>
      </ProtectedRoute>
    );
  }
