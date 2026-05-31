import { apiFetch } from '@/lib/api/client';

export const progressApi = {
  listMetrics(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<{ items: any[] }>(`/api/progress/metrics${query}`);
  },
  listPhotos(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<{ items: any[] }>(`/api/progress/photos${query}`);
  },
  listCheckins(clientUserId?: string) {
    const query = clientUserId ? `?clientUserId=${clientUserId}` : '';
    return apiFetch<{ items: any[] }>(`/api/progress/checkins${query}`);
  },
  listCoachClients() {
    return apiFetch<{ items: { id: string; name: string; email: string }[] }>('/api/training/coach-clients');
  },
};
