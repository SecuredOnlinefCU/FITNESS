import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { LiveClientToday } from '@/components/client/live/live-client-today';

export default function ClientTodayPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Today" subtitle="Your adaptive LevelFITness plan for the next best action." />
        <LiveClientToday />
      </DashboardShell>
    </ProtectedRoute>
  );
}
