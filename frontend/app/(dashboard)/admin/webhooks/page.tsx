'use client';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminListShell } from '@/components/admin/admin-list-shell';
import { adminExtendedApi } from '@/lib/api/modules/admin-extended';


export default function AdminWebhooksPage() {
  return (
    <ProtectedRoute roles={['super_admin']}>
      <DashboardShell>
        <AdminPageHeader title="Webhook events" subtitle="Stripe webhook event processing and errors." />
        <AdminListShell
          title="Webhook events"
          description="Stripe webhook event processing and errors."
          loader={() => adminExtendedApi.webhookEvents()}
          emptyTitle="No webhook events"
          emptyDescription="Stripe webhook events will appear after provider setup."
          renderItem={(item) => <pre className='overflow-auto text-xs text-muted-foreground'>{JSON.stringify(item, null, 2)}</pre>}
        />
      </DashboardShell>
    </ProtectedRoute>
  );
}
