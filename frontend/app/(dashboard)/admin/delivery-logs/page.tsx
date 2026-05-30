'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';


export default function AdminDeliveryLogsPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Delivery logs" subtitle="Email and push delivery tracking." />
        <AdminListShell
          title="Delivery logs"
          description="Email and push delivery tracking."
          loader={() => adminExtendedApi.deliveryLogs()}
          emptyTitle="No delivery logs"
          emptyDescription="Email/push attempts will appear after notifications send."
          renderItem={(item) => <pre className='overflow-auto text-xs text-slate-600'>{JSON.stringify(item, null, 2)}</pre>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
