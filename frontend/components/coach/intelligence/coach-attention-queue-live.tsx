'use client';

import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { useCoachAttentionQueue } from '@/hooks/coach-intelligence/use-coach-attention-queue';
import { AttentionScoreCard } from './attention-score-card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

export function CoachAttentionQueueLive() {
  const queue = useCoachAttentionQueue();

  async function refresh() {
    await coachIntelligenceApi.refreshAttentionQueue();
    await queue.reload();
  }

  if (queue.loading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (queue.error) return <ErrorState message={queue.error} onRetry={queue.reload} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={refresh}>Refresh scores</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(queue.data?.items || []).map((item) => <AttentionScoreCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
