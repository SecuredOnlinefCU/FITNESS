import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { RiskSignalScanPanel } from '@/components/coach/intelligence/risk-signal-scan-panel';
import { RiskSignalExplainer } from '@/components/coach/intelligence/risk-signal-explainer';
import { RiskFlagsLive } from '@/components/coach/intelligence/risk-flags-live';

export default function CoachRiskSignalsPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Risk signals" subtitle="Scan for low adherence, stalled progress, and payment/access risks." />
        <div className="space-y-6">
          <RiskSignalScanPanel />
          <RiskSignalExplainer />
          <RiskFlagsLive />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
