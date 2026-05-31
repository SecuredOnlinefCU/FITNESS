import { apiFetch } from '@/lib/api/client';
import type { ApiList, MetricEntry, MetricSummary, ProgressPhoto } from '@/lib/types/domain';

export const progressApi = {
  listMetrics(clientUserId?: string, filters?: { metricType?: string; from?: string; to?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (clientUserId) params.set('clientUserId', clientUserId);
    if (filters?.metricType) params.set('metricType', filters.metricType);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return apiFetch<ApiList<MetricEntry>>(`/api/progress/metrics${qs ? `?${qs}` : ''}`);
  },
  getMetricsSummary(clientUserId?: string) {
    const qs = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<MetricSummary>>(`/api/progress/metrics/summary${qs}`);
  },
  listPhotos(clientUserId?: string) {
    const qs = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<ProgressPhoto>>(`/api/progress/photos${qs}`);
  },
  getComparePhotos(beforePhotoId: string, afterPhotoId: string) {
    return apiFetch<{ before: ProgressPhoto | null; after: ProgressPhoto | null }>(`/api/progress/photos/compare?beforePhotoId=${beforePhotoId}&afterPhotoId=${afterPhotoId}`);
  },
  listCheckins(clientUserId?: string) {
    const qs = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<ApiList<unknown>>(`/api/progress/checkins${qs}`);
  },
  listCoachClients() {
    return apiFetch<ApiList<{ id: string; firstName: string; lastName: string; email: string }>>('/api/training/coach-clients');
  },
};
