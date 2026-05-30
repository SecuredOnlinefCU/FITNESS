'use client';

import { useClientToday } from '@/hooks/intelligence/use-client-today';
import { TodayScoreCard } from '@/components/intelligence/today-score-card';
import { NextBestActionList } from '@/components/intelligence/next-best-action-list';
import { RecoverySignalCard } from '@/components/wearables/recovery-signal-card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

export function LiveClientToday() {
  const today = useClientToday();

  if (today.loading) {
    return <div className="grid gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  }

  if (today.error) return <ErrorState message={today.error} onRetry={today.reload} />;

  return (
    <div className="space-y-4">
      <TodayScoreCard score={today.data?.completionScore ?? 0} />
      <NextBestActionList items={today.data?.recommendations || []} onComplete={today.reload} />
      <RecoverySignalCard snapshot={today.data?.snapshot} />
    </div>
  );
}
