'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { ClientRiskFlagCard } from './client-risk-flag-card';
import { ListSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { EmptyState } from '@/components/states/empty-state';

export function RiskFlagsLive({ clientUserId }: { clientUserId?: string }) {
  const flags = useAsyncData(() => coachIntelligenceApi.riskFlags(clientUserId), [clientUserId]);

  if (flags.loading) return <ListSkeleton rows={4} />;
  if (flags.error) return <ErrorState message={flags.error} onRetry={flags.reload} />;
  if (!flags.data?.items?.length) return <EmptyState title="No open risk flags" description="Client risk signals will appear here when LevelFITness detects something that needs coach attention." />;

  return <div className="space-y-3">{flags.data.items.map((flag) => <ClientRiskFlagCard key={flag.id} flag={flag} onResolved={flags.reload} />)}</div>;
}
