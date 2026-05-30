import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';


export default function ClientTasksPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Tasks" subtitle="Complete assignments, upload videos, and review coach feedback." />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="font-bold">Open tasks</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Submitted tasks</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Coach feedback</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
