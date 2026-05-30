import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { WearableConnectionStatus } from '@/components/wearables/wearable-connection-status';
import { RecoverySummaryCard } from '@/components/recovery/recovery-summary-card';

export default function ClientRecoveryPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Recovery" subtitle="Connect wearable data and review sleep, readiness, and recovery signals." />
        <div className="space-y-4"><WearableConnectionStatus /><RecoverySummaryCard /></div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
