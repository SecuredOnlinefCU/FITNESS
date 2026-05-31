import { apiFetch } from '@/lib/api/client';
import type { ApiList, RecoverySnapshot } from '@/lib/types/domain';

type UpsertMetricInput = {
  metricDate?: string;
  provider?: string;
  sleepMinutes?: number;
  sleepScore?: number;
  restingHeartRate?: number;
  hrvMs?: number;
  steps?: number;
  caloriesBurned?: number;
  readinessScore?: number;
  sourcePayloadJson?: unknown;
};

export const recoveryApi = {
  today() { return apiFetch<ApiList<RecoverySnapshot>>('/api/recovery/today'); },
  history(days = 30) { return apiFetch<ApiList<RecoverySnapshot>>(`/api/recovery/history?days=${days}`); },
  upsertMetric(input: UpsertMetricInput) { return apiFetch<RecoverySnapshot>('/api/recovery/metrics', { method: 'POST', body: JSON.stringify(input) }); },
};
