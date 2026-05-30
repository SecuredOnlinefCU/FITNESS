import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { PackageBuilderShell } from '@/components/coach/package-builder-shell';

export default function PackagesPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Packages and payments" subtitle="Create offers, manage pricing, and prepare Stripe checkout flows." />
        <PackageBuilderShell />
      </DashboardShell>
    </ProtectedRoute>
  );
}
