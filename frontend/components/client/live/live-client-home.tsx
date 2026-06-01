'use client';

import { programsApi } from '@/lib/api/modules/programs';
import { tasksApi } from '@/lib/api/modules/tasks';
import { notificationsApi } from '@/lib/api/modules/notifications';
import { recoveryApi } from '@/lib/api/modules/recovery';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { LiveStatGrid } from '@/components/dashboard/live-stat-grid';
import { TodayFocus } from '@/components/client/today-focus';
import { ActionCard } from '@/components/client/action-card';
import { ErrorState } from '@/components/states/error-state';
import { CheckCircle2, Flame, Utensils, Trophy, Moon } from 'lucide-react';
import type { TaskAssignment } from '@/lib/types/domain';

async function loadClientHome() {
  const [programs, tasks, notifications, recovery] = await Promise.allSettled([
    programsApi.listPrograms(),
    tasksApi.listTasks(),
    notificationsApi.listNotifications(),
    recoveryApi.today(),
  ]);

  const programCount = programs.status === 'fulfilled' ? programs.value.items.length : 0;
  const allTasks = tasks.status === 'fulfilled' ? tasks.value.items : [];
  const openTasks = (allTasks as TaskAssignment[]).filter((t) => t.status === 'assigned' || !t.status);
  const unreadCount = notifications.status === 'fulfilled' ? notifications.value.items.filter((item) => !item.openedAt).length : 0;
  const recoveryData = recovery.status === 'fulfilled' ? recovery.value : null;
  const streak = recoveryData?.items?.[0]?.streakDays ?? 0;
  const readiness = recoveryData?.items?.[0]?.readinessScore ?? null;

  return {
    stats: [
      { label: 'Programs', value: String(programCount), helper: 'Active coaching spaces.' },
      { label: 'Open tasks', value: String(openTasks.length), helper: 'Assignments and check-ins.' },
      { label: 'Unread updates', value: String(unreadCount), helper: 'Messages and notifications.' },
    ],
    streak,
    readiness,
    focusItems: [
      {
        icon: CheckCircle2,
        title: 'Tasks',
        detail: openTasks.length > 0 ? `${openTasks.length} task${openTasks.length === 1 ? '' : 's'} pending` : 'No tasks due today',
        href: '/client/tasks',
      },
      { icon: Flame, title: 'Workout', detail: programCount > 0 ? 'Active program assigned' : 'No program assigned yet', href: '/client/workouts' },
      {
        icon: Utensils,
        title: 'Nutrition',
        detail: unreadCount > 0 ? `${unreadCount} update${unreadCount === 1 ? '' : 's'} to review` : 'Log your next meal',
        href: '/client/nutrition',
      },
    ],
  };
}

export function LiveClientHome() {
  const result = useAsyncData(loadClientHome, []);

  return (
    <div className="space-y-6">
      <LiveStatGrid loading={result.loading} error={result.error} stats={result.data?.stats} onRetry={result.reload} />
      {result.error ? <ErrorState message={result.error} onRetry={result.reload} /> : null}

      {(result.data?.streak ?? 0) > 0 || result.data?.readiness != null ? (
        <div className="grid gap-4 grid-cols-2">
          {result.data && result.data.streak > 0 && (
            <div className="rounded-2xl border border-energy/20 bg-card p-4 flex items-center gap-3">
              <div className="rounded-2xl bg-energy/10 p-3"><Trophy className="h-5 w-5 text-energy" /></div>
              <div>
                <p className="text-2xl font-black text-energy">{result.data.streak}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
          )}
          {result.data && result.data.readiness != null && (
            <div className="rounded-2xl border border-flow/20 bg-card p-4 flex items-center gap-3">
              <div className="rounded-2xl bg-flow/10 p-3"><Moon className="h-5 w-5 text-flow" /></div>
              <div>
                <p className={`text-2xl font-black ${result.data.readiness >= 70 ? 'text-flow' : result.data.readiness >= 40 ? 'text-energy' : 'text-pulse'}`}>{result.data.readiness}%</p>
                <p className="text-xs text-muted-foreground">Readiness</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <TodayFocus items={result.data?.focusItems} streak={result.data?.streak} />
        <div className="space-y-4">
          <ActionCard href="/client/workouts" title="Training" description="Open assigned workouts and log your sets." label="Open" />
          <ActionCard href="/client/nutrition" title="Nutrition" description="Log meals and track macro targets." label="Log" />
          <ActionCard href="/client/progress" title="Progress" description="Add metrics and progress photos." label="Track" />
        </div>
      </div>
    </div>
  );
}