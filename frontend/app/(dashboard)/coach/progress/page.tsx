'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { ProgressClientSelector } from '@/components/coach/progress/progress-client-selector';
import { MetricsDashboard } from '@/components/metrics/metrics-dashboard';
import { ProgressPhotoGrid } from '@/components/coach/progress/progress-photo-grid';
import { ProgressCheckinList } from '@/components/coach/progress/progress-checkin-list';
import { Camera, ClipboardCheck, BarChart3 } from 'lucide-react';

export default function CoachProgressPage() {
  const [selectedClientId, setSelectedClientId] = useState('');

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Progress review" subtitle="Review client metrics, progress photos, and check-in data across your roster." />

        <div className="mb-5">
          <ProgressClientSelector selectedId={selectedClientId} onChange={setSelectedClientId} />
        </div>

        {selectedClientId ? (
          <div className="space-y-5">
            <MetricsDashboard clientUserId={selectedClientId} />
            <div className="grid gap-5 md:grid-cols-2">
              <ProgressPhotoGrid clientUserId={selectedClientId} />
              <ProgressCheckinList clientUserId={selectedClientId} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-muted p-10 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-bold text-muted-foreground">Select a client above</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose a client to view their progress metrics, photos, and check-in history.</p>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
