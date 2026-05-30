'use client';

import { programsApi } from '@/lib/api/modules/programs';
import { tasksApi } from '@/lib/api/modules/tasks';
import { paymentsApi } from '@/lib/api/modules/payments';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { CoachStatCard } from '@/components/coach/coach-stat-card';
import { AttentionQueue } from '@/components/coach/attention-queue';
import { CoachActionCard } from '@/components/coach/coach-action-card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

async function loadCoachHome() {
  const [programs, tasks, packages] = await Promise.allSettled([
    programsApi.listPrograms(),
    tasksApi.listTasks(),
    paymentsApi.listPackages(),
  ]);

  return {
    programs: programs.status === 'fulfilled' ? programs.value.items.length : 0,
    tasks: tasks.status === 'fulfilled' ? tasks.value.items.length : 0,
    packages: packages.status === 'fulfilled' ? packages.value.items.length : 0,
  };
}

export function LiveCoachHome() {
  const result = useAsyncData(loadCoachHome, []);

  if (result.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <CoachStatCard label="Programs" value={String(result.data?.programs ?? 0)} />
        <CoachStatCard label="Tasks" value={String(result.data?.tasks ?? 0)} />
        <CoachStatCard label="Packages" value={String(result.data?.packages ?? 0)} />
        <CoachStatCard label="Reviews due" value="0" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <AttentionQueue />
        <div className="space-y-4">
          <CoachActionCard href="/coach/programs/new" title="Create a program" description="Set up a coaching container for clients." />
          <CoachActionCard href="/coach/workouts/builder" title="Build a workout" description="Create reusable training sessions." />
          <CoachActionCard href="/coach/packages/new" title="Create a package" description="Launch a paid coaching offer." />
        </div>
      </div>
    </div>
  );
}
