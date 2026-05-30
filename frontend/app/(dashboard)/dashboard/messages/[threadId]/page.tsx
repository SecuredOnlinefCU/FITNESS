import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { LiveThreadView } from '@/components/messaging/realtime/live-thread-view';

export default async function MessageThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  return (
    <ProtectedRoute>
      <DashboardShell>
        <ClientPageHeader title="Live conversation" subtitle="WebSocket-first messaging with optimistic send, HTTP fallback, and delivery status." />
        <LiveThreadView threadId={threadId} />
      </DashboardShell>
    </ProtectedRoute>
  );
}
