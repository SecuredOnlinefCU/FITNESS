import { Bell } from 'lucide-react';

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="relative inline-flex">
      <Bell className="h-5 w-5 text-bone" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-pulse px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </div>
  );
}
