'use client';

import { useThreadListPolling } from '@/hooks/messaging/use-message-polling';
import { ThreadList } from '@/components/messaging/thread-list';
import { ListSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import type { Thread } from '@/lib/types/domain';

export function LiveInboxShell() {
  const result = useThreadListPolling(12000);

  if (result.loading) return <ListSkeleton rows={5} />;
  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  return (
    <ThreadList
      threads={result.data?.items || []}
      getThreadHref={(t: Thread) => `/dashboard/messages/${t.id}`}
    />
  );
}
