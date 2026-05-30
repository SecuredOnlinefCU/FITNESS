import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { WorkoutBuilderShell } from '@/components/coach/workout-builder-shell';

export default function WorkoutBuilderPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Workout builder" subtitle="Create structured workouts that can be assigned to clients." />
        <WorkoutBuilderShell />
      </DashboardShell>
    </ProtectedRoute>
  );
}
