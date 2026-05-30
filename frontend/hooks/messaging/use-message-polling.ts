'use client';

import { messagingApi } from '@/lib/api/modules/messaging';
import { usePollingData } from '@/hooks/data/use-polling-data';

export function useThreadListPolling(intervalMs = 12000) {
  return usePollingData(() => messagingApi.listThreads(), intervalMs, []);
}
