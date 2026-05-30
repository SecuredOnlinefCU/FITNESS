import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { StatCard } from '@/components/client/stat-card';
import { ActionCard } from '@/components/client/action-card';
import { TodayFocus } from '@/components/client/today-focus';

export default function ClientHomePage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Your LevelFITness home" subtitle="See what matters today: workouts, tasks, meals, progress, and coach updates." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Current streak" value="0 days" helper="Start by completing today’s focus." />
          <StatCard label="Open tasks" value="0" helper="Assigned tasks will appear here." />
          <StatCard label="Unread updates" value="0" helper="Messages and notifications." />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <TodayFocus />
          <div className="space-y-4">
            <ActionCard href="/client/workouts" title="Training" description="Open assigned workouts and log your sets." label="Open" />
            <ActionCard href="/client/nutrition" title="Nutrition" description="Log meals and track macro targets." label="Log" />
            <ActionCard href="/client/progress" title="Progress" description="Add metrics and progress photos." label="Track" />
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
