import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { ClientHealthDashboardLive } from '@/components/coach/intelligence/client-health-dashboard-live';

export default function CoachClientHealthPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Client health" subtitle="Review client health scores, risk context, and recommended coach actions." />
        <ClientHealthDashboardLive />
      </DashboardShell>
    </ProtectedRoute>
  );
}
