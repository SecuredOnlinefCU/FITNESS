'use client';

import { usePollingData } from '@/hooks/data/use-polling-data';
import { notificationsApi } from '@/lib/api/modules/notifications';

export function useUnreadNotificationCount(pollInterval = 30000): number {
  const result = usePollingData(() => notificationsApi.listNotifications(), pollInterval, []);
  const items = result.data?.items ?? [];
  return items.filter((n: any) => !n.readAt).length;
}
