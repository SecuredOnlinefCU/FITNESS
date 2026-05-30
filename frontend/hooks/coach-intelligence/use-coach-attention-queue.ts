'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';

export function useCoachAttentionQueue() {
  return useAsyncData(() => coachIntelligenceApi.attentionQueue(), []);
}
