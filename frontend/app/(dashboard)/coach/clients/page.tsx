import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function CoachClientsPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Clients" subtitle="Track client status, tasks, progress, and communication in one place." />
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent><h2 className="font-bold">Active clients</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Needs attention</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
          <Card><CardContent><h2 className="font-bold">Recently onboarded</h2><p className="mt-1 text-sm text-muted-foreground">This section is ready for API-driven data.</p></CardContent></Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
