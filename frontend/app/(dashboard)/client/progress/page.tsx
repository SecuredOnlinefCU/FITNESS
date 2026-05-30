'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { TrendingUp, Camera, ClipboardCheck, Target } from 'lucide-react';

export default function ClientProgressPage() {
  const metrics = useAsyncData(() => apiFetch<{ items: any[] }>('/api/progress/metrics'), []);
  const photos = useAsyncData(() => apiFetch<{ items: any[] }>('/api/progress/photos'), []);
  const checkins = useAsyncData(() => apiFetch<{ items: any[] }>('/api/progress/checkins'), []);

  const loading = metrics.loading || photos.loading || checkins.loading;
  const error = metrics.error || photos.error || checkins.error;
  const data = {
    metrics: metrics.data?.items.length ?? 0,
    photos: photos.data?.items.length ?? 0,
    checkins: checkins.data?.items.length ?? 0,
  };

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Progress" subtitle="Track your body metrics, progress photos, and check-in history." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { metrics.reload(); photos.reload(); checkins.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><TrendingUp className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Body metrics</p>
                    <p className="text-2xl font-black">{data.metrics}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
          </div>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Performance trends</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Weight, body fat, and strength progression charts will appear once you log your first metrics.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
