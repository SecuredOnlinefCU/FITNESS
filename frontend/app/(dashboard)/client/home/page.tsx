import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { LiveClientHome } from '@/components/client/live/live-client-home';

export default function ClientHomePage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Your dashboard" subtitle="Your training, nutrition, progress, and coach communication in one place." />
        <LiveClientHome />
      </DashboardShell>
    </ProtectedRoute>
  );
}
