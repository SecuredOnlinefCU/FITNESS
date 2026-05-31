'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { MetricsDashboard } from '@/components/metrics/metrics-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { Camera, ClipboardCheck } from 'lucide-react';

export default function ClientProgressPage() {
  const photos = useAsyncData(() => apiFetch<{ items: any[] }>('/api/progress/photos'), []);
  const checkins = useAsyncData(() => apiFetch<{ items: any[] }>('/api/progress/checkins'), []);

  const loading = photos.loading || checkins.loading;
  const error = photos.error || checkins.error;
  const data = {
    photos: photos.data?.items.length ?? 0,
    checkins: checkins.data?.items.length ?? 0,
  };

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Progress" subtitle="Track your body metrics, progress photos, and check-in history." />

        {error ? (
          <ErrorState message={error} onRetry={() => { photos.reload(); checkins.reload(); }} />
        ) : (
          <>
            <div className="mb-5 grid gap-4 md:grid-cols-2">
              {loading ? (
                <><CardSkeleton /><CardSkeleton /></>
              ) : (
                <>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-muted p-3 text-primary"><Camera className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Progress photos</p>
                          <p className="text-2xl font-black">{data.photos}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardCheck className="h-5 w-5" /></div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check-ins</p>
                          <p className="text-2xl font-black">{data.checkins}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <MetricsDashboard />
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
