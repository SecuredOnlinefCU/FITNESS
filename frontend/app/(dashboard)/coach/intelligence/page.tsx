import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { CoachAttentionQueueLive } from '@/components/coach/intelligence/coach-attention-queue-live';
import { RiskFlagsLive } from '@/components/coach/intelligence/risk-flags-live';

export default function CoachIntelligencePage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Coach intelligence" subtitle="See which clients need attention, why they are flagged, and what to handle first." />
        <div className="space-y-8">
          <CoachAttentionQueueLive />
          <RiskFlagsLive />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
