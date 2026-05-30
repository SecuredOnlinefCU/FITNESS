import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminDashboardLive } from '@/components/admin/admin-dashboard-live';

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Platform controls" subtitle="Monitor LevelFITness users, reports, audit logs, delivery, feature flags, and webhook health." />
        <AdminDashboardLive />
      </DashboardShell>
    </ProtectedRoute>
  );
}
