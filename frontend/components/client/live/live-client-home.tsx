'use client';

import { programsApi } from '@/lib/api/modules/programs';
import { tasksApi } from '@/lib/api/modules/tasks';
import { notificationsApi } from '@/lib/api/modules/notifications';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { LiveStatGrid } from '@/components/dashboard/live-stat-grid';
import { TodayFocus } from '@/components/client/today-focus';
import { ActionCard } from '@/components/client/action-card';
import { ErrorState } from '@/components/states/error-state';

async function loadClientHome() {
  const [programs, tasks, notifications] = await Promise.allSettled([
    programsApi.listPrograms(),
    tasksApi.listTasks(),
    notificationsApi.listNotifications(),
  ]);

  const programCount = programs.status === 'fulfilled' ? programs.value.items.length : 0;
  const taskCount = tasks.status === 'fulfilled' ? tasks.value.items.length : 0;
  const unreadCount = notifications.status === 'fulfilled' ? notifications.value.items.filter((item) => !item.openedAt).length : 0;

  return {
    stats: [
      { label: 'Programs', value: String(programCount), helper: 'Active coaching spaces.' },
      { label: 'Open tasks', value: String(taskCount), helper: 'Assignments and check-ins.' },
      { label: 'Unread updates', value: String(unreadCount), helper: 'Messages and notifications.' },
    ],
  };
}

export function LiveClientHome() {
  const result = useAsyncData(loadClientHome, []);

  return (
    <div className="space-y-6">
      <LiveStatGrid loading={result.loading} error={result.error} stats={result.data?.stats} onRetry={result.reload} />
      {result.error ? <ErrorState message={result.error} onRetry={result.reload} /> : null}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <TodayFocus />
        <div className="space-y-4">
          <ActionCard href="/client/workouts" title="Training" description="Open assigned workouts and log your sets." label="Open" />
          <ActionCard href="/client/nutrition" title="Nutrition" description="Log meals and track macro targets." label="Log" />
          <ActionCard href="/client/progress" title="Progress" description="Add metrics and progress photos." label="Track" />
        </div>
      </div>
    </div>
  );
}
