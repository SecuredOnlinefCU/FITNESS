'use client';

import { clientHealthApi } from '@/lib/api/modules/client-health';
import { useClientHealthScores } from '@/hooks/coach-intelligence/use-client-health-scores';
import { ClientHealthScoreCard } from './client-health-score-card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

export function ClientHealthDashboardLive() {
  const scores = useClientHealthScores();

  async function refresh() {
    await clientHealthApi.refreshScores();
    await clientHealthApi.generateRecommendations();
    await scores.reload();
  }

  if (scores.loading) return <div className="grid gap-4 md:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>;
  if (scores.error) return <ErrorState message={scores.error} onRetry={scores.reload} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={refresh}>Refresh health scores</Button></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(scores.data?.items || []).map((item) => <ClientHealthScoreCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}
