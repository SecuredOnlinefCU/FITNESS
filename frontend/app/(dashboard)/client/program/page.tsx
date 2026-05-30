import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';


export default function ClientProgramPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Primary program" subtitle="Your selected program, coach context, and program-specific activity." />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="font-bold">Program overview</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Coach notes</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Program guidelines</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
