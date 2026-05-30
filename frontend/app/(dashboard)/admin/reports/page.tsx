'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';


export default function AdminReportsPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Reports" subtitle="Moderation reports and content review queue." />
        <AdminListShell
          title="Reports"
          description="Moderation reports and content review queue."
          loader={() => adminExtendedApi.reports()}
          emptyTitle="No open reports"
          emptyDescription="Content reports will appear here when submitted."
          renderItem={(item) => <pre className='overflow-auto text-xs text-slate-600'>{JSON.stringify(item, null, 2)}</pre>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
