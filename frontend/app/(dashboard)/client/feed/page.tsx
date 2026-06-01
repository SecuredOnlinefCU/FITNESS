'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { feedApi } from '@/lib/api/modules/feed';
import { programsApi } from '@/lib/api/modules/programs';
import type { FeedPost, FeedPostType } from '@/lib/types/domain';
import { PostCard } from '@/components/feed/post-card';
import { MomentumRing } from '@/components/feed/momentum-ring';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';
import { toast } from 'sonner';

const typeTabs: { value: FeedPostType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'COACH_MESSAGE', label: 'Coach' },
  { value: 'WORKOUT_ASSIGNED', label: 'Workouts' },
  { value: 'MILESTONE', label: 'Milestones' },
  { value: 'CHECK_IN_PROMPT', label: 'Check-ins' },
  { value: 'RECOVERY_ALERT', label: 'Recovery' },
  { value: 'NUTRITION_HACK', label: 'Nutrition' },
  { value: 'CHALLENGE_UPDATE', label: 'Challenges' },
  { value: 'PROGRESS_SPOTLIGHT', label: 'Progress' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function ClientFeedPage() {
  const [typeFilter, setTypeFilter] = useState<FeedPostType | 'ALL'>('ALL');

  const programs = useAsyncData(() => programsApi.listPrograms());
  const programId = (programs.data?.items?.[0] as { program?: { id: string } } | undefined)?.program?.id;
  const posts = useAsyncData(
    () => programId ? feedApi.listProgramPosts(programId, typeFilter === 'ALL' ? undefined : typeFilter) : Promise.resolve({ items: [] }),
    [programId, typeFilter]
  );
  const momentum = useAsyncData(() => feedApi.getMomentum(), []);

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

  function handleActionClick(action: NonNullable<FeedPost['primaryAction']>) {
    if (action.href) window.location.href = action.href;
  }

  if (posts.loading || momentum.loading || programs.loading) {
    return (
      <motion.div className="mx-auto max-w-3xl space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </motion.div>
    );
  }

  if (posts.error) return <ErrorState message={posts.error} onRetry={() => posts.reload()} />;

  return (
    <motion.div
      className="mx-auto max-w-3xl space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your personalized feed</p>
          <h1 className="text-3xl font-black tracking-tight">Feed</h1>
        </div>
      </motion.div>

      {momentum.data && (
        <motion.div variants={itemVariants} className="rounded-2xl border border-border bg-card p-5">
          <MomentumRing data={momentum.data} />
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {typeTabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              typeFilter === t.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/75'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {(!posts.data?.items || posts.data.items.length === 0) ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="No posts yet"
            description="Check back later for updates from your coach."
          />
        </motion.div>
      ) : (
        <motion.div className="space-y-4" variants={containerVariants}>
          {posts.data.items.map(post => (
            <motion.div key={post.id} variants={itemVariants} layout>
              <PostCard
                post={post}
                onReactionToggle={handleReactionToggle}
                onSaveToggle={handleSaveToggle}
                onCommentAdded={handleCommentAdded}
                onActionClick={handleActionClick}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
