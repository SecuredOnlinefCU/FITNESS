'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { clientHealthApi } from '@/lib/api/modules/client-health';

export function useClientHealthScores() {
  return useAsyncData(() => clientHealthApi.scores(), []);
}
