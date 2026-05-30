import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { ProgramBuilderShell } from '@/components/coach/program-builder-shell';

export default function NewProgramPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="New program" subtitle="Create the structure your clients will train, check in, and communicate inside." />
        <ProgramBuilderShell />
      </DashboardShell>
    </ProtectedRoute>
  );
}
