import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { CoachStatCard } from '@/components/coach/coach-stat-card';
import { CoachActionCard } from '@/components/coach/coach-action-card';
import { AttentionQueue } from '@/components/coach/attention-queue';

export default function CoachHomePage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Coach command center" subtitle="Build programs, review client work, and keep every client moving forward." />
        <div className="grid gap-4 md:grid-cols-4">
          <CoachStatCard label="Active clients" value="0" trend="Ready for onboarding" />
          <CoachStatCard label="Programs" value="0" />
          <CoachStatCard label="Reviews due" value="0" />
          <CoachStatCard label="Monthly revenue" value="$0" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <AttentionQueue />
          <div className="space-y-4">
            <CoachActionCard href="/coach/programs/new" title="Create a program" description="Set up a coaching container for clients." />
            <CoachActionCard href="/coach/workouts/builder" title="Build a workout" description="Create reusable training sessions." />
            <CoachActionCard href="/coach/packages" title="Create a package" description="Launch a paid coaching offer." />
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
