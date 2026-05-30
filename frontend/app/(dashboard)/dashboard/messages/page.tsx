import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { LiveInboxShell } from '@/components/messaging/live/live-inbox-shell';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <ClientPageHeader title="Messages" subtitle="A near-real-time inbox with automatic refresh." />
        <LiveInboxShell />
      </DashboardShell>
    </ProtectedRoute>
  );
}
