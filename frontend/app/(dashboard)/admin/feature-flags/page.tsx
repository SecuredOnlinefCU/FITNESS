'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';


export default function AdminFeatureFlagsPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Feature flags" subtitle="Control gradual rollout and platform behavior." />
        <AdminListShell
          title="Feature flags"
          description="Control gradual rollout and platform behavior."
          loader={() => adminExtendedApi.featureFlags()}
          emptyTitle="No feature flags"
          emptyDescription="Feature flags will appear when configured."
          renderItem={(item) => <pre className='overflow-auto text-xs text-slate-600'>{JSON.stringify(item, null, 2)}</pre>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
