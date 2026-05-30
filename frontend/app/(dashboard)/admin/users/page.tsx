'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';
import { UserStatusControl } from '@/components/admin/user-status-control';

export default function AdminUsersPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Users" subtitle="Review user accounts and update account status." />
        <AdminListShell
          title="Users"
          description="Review user accounts and update account status."
          loader={() => adminExtendedApi.users()}
          emptyTitle="No users found"
          emptyDescription="User records will appear after accounts are created."
          renderItem={(item) => <div className='space-y-3'><pre className='overflow-auto text-xs text-slate-600'>{JSON.stringify(item, null, 2)}</pre>{item.id ? <UserStatusControl userId={item.id} currentStatus={item.status || 'active'} /> : null}</div>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
