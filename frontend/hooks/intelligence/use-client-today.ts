'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { intelligenceApi } from '@/lib/api/modules/intelligence';

export function useClientToday() {
  return useAsyncData(() => intelligenceApi.getToday(), []);
}
