'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';


export default function AdminAuditLogsPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Audit logs" subtitle="Sensitive admin and platform actions." />
        <AdminListShell
          title="Audit logs"
          description="Sensitive admin and platform actions."
          loader={() => adminExtendedApi.auditLogs()}
          emptyTitle="No audit logs"
          emptyDescription="Admin mutations will create audit entries."
          renderItem={(item) => <pre className='overflow-auto text-xs text-slate-600'>{JSON.stringify(item, null, 2)}</pre>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
