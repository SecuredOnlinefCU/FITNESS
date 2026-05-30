import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { AdaptiveWorkoutWarningList } from '@/components/coach/intelligence/adaptive-workout-warning-list';

export default function CoachRecoveryPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Recovery intelligence" subtitle="Use sleep and readiness signals to identify when workouts may need adjustment." />
        <AdaptiveWorkoutWarningList />
      </DashboardShell>
    </ProtectedRoute>
  );
}
