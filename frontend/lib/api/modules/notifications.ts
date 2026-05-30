import { apiFetch } from '@/lib/api/client';
import type { ApiList, Notification } from '@/lib/types/domain';

export const notificationsApi = {
  listNotifications() {
    return apiFetch<ApiList<Notification>>('/api/notifications');
  },
};
