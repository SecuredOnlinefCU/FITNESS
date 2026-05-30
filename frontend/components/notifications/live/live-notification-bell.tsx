'use client';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { useUnreadNotificationCount } from '@/hooks/use-unread-counts';

export function LiveNotificationBell() {
  const count = useUnreadNotificationCount();
  return <NotificationBell unreadCount={count} />;
}
