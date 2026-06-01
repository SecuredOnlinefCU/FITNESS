'use client';

import { useState, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { MetricsDashboard } from '@/components/metrics/metrics-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, ListSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { progressApi } from '@/lib/api/modules/progress';
import { trainingApi } from '@/lib/api/modules/training';
import { ProgressPhotoCompare } from '@/components/progress/progress-photo-compare';
import { Camera, ClipboardCheck, ScanSearch, Trophy, Plus, X, Loader, Activity } from 'lucide-react';

const PHOTO_TYPES = ['FRONT', 'SIDE', 'BACK'] as const;
const METRIC_TYPES = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'body_fat', label: 'Body Fat', unit: '%' },
  { value: 'chest', label: 'Chest', unit: 'cm' },
  { value: 'waist', label: 'Waist', unit: 'cm' },
  { value: 'hips', label: 'Hips', unit: 'cm' },
  { value: 'arms', label: 'Arms', unit: 'cm' },
  { value: 'thighs', label: 'Thighs', unit: 'cm' },
  { value: 'calves', label: 'Calves', unit: 'cm' },
  { value: 'shoulders', label: 'Shoulders', unit: 'cm' },
  { value: 'neck', label: 'Neck', unit: 'cm' },
];

export default function ClientProgressPage() {
  const photos = useAsyncData(() => progressApi.listPhotos(), []);
  const checkins = useAsyncData(() => progressApi.listCheckins(), []);
  const estimatedMaxes = useAsyncData(() => trainingApi.getEstimatedMaxes(), []);
  const [showCompare, setShowCompare] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [metricForm, setMetricForm] = useState({ metricType: 'weight', value: '' });
  const [loggingMetric, setLoggingMetric] = useState(false);

  const loading = photos.loading || checkins.loading;
  const error = photos.error || checkins.error;
  const photoItems = photos.data?.items ?? [];
  const data = { photos: photoItems.length, checkins: checkins.data?.items.length ?? 0 };
  const estimates = estimatedMaxes.data?.estimates ?? [];

  const handleLogMetric = useCallback(async () => {
    if (!metricForm.value) return;
    setLoggingMetric(true);
    try {
      const mt = METRIC_TYPES.find(m => m.value === metricForm.metricType);
      await progressApi.logMetric({
        metricType: metricForm.metricType,
        value: Number(metricForm.value),
        unit: mt?.unit,
      });
      setMetricForm({ metricType: 'weight', value: '' });
      setShowMetricForm(false);
    } finally {
      setLoggingMetric(false);
    }
  }, [metricForm]);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Progress" subtitle="Track your body metrics, progress photos, and check-in history." />

        {error ? (
          <ErrorState message={error} onRetry={() => { photos.reload(); checkins.reload(); }} />
        ) : (
          <>
            <div className="mb-5 grid gap-4 md:grid-cols-3">
              {loading ? (
                <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
              ) : (
                <>
                  <Card>
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-muted p-3 text-primary"><Camera className="h-5 w-5" /></div>
                        <div><p className="text-sm text-muted-foreground">Progress photos</p><p className="text-2xl font-black">{data.photos}</p></div>
                      </div>
                      {data.photos >= 2 && (
                        <button onClick={() => setShowCompare(true)} className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-bold text-foreground transition hover:bg-ink-800">
                          <ScanSearch className="h-4 w-4" /> Compare
                        </button>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardCheck className="h-5 w-5" /></div>
                        <div><p className="text-sm text-muted-foreground">Check-ins</p><p className="text-2xl font-black">{data.checkins}</p></div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-muted p-3 text-energy"><Trophy className="h-5 w-5" /></div>
                          <div><p className="text-sm text-muted-foreground">Estimated 1RMs</p><p className="text-2xl font-black">{estimates.length}</p></div>
                        </div>
                        <button onClick={() => setShowMetricForm(!showMetricForm)} className="rounded-xl bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition" aria-label="Log metric">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {showMetricForm && (
              <Card className="mb-5">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black">Log a metric</h3>
                    <button onClick={() => setShowMetricForm(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Metric</label>
                      <select value={metricForm.metricType} onChange={e => setMetricForm(f => ({ ...f, metricType: e.target.value }))} className="w-full rounded-xl border border-border bg-card p-2.5 text-base">
                        {METRIC_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Value</label>
                      <input type="number" min={0} step={0.1} value={metricForm.value} onChange={e => setMetricForm(f => ({ ...f, value: e.target.value }))} placeholder={METRIC_TYPES.find(m => m.value === metricForm.metricType)?.unit} className="w-full rounded-xl border border-border bg-card p-2.5 text-base text-center" />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleLogMetric} disabled={loggingMetric || !metricForm.value} className="w-full">
                        {loggingMetric ? <Loader className="h-4 w-4 animate-spin" /> : 'Log'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && data.photos > 0 && (
              <Card className="mb-5">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold">Recent photos</h3>
                    <div className="flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition">
                        <Camera className="h-3 w-3" /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // For now, create a photo record — in production this would upload to S3 first
                          await progressApi.uploadPhoto({ photoType: 'CUSTOM', notes: file.name });
                          photos.reload();
                        }} />
                      </label>
                      {data.photos >= 2 && (
                        <button onClick={() => setShowCompare(true)} className="flex items-center gap-1 text-sm font-bold text-primary">
                          <ScanSearch className="h-4 w-4" /> Compare all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 md:grid-cols-6">
                    {photoItems.slice(0, 6).map(p => (
                      <div key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                        {p.media?.cdnUrl ? (
                          <img src={p.media.cdnUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{p.photoType}</div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                          <p className="text-[10px] text-white">{new Date(p.capturedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {estimatedMaxes.loading ? (
              <div className="mb-5 space-y-2"><ListSkeleton /></div>
            ) : estimates.length > 0 ? (
              <Card className="mb-5">
                <CardContent className="p-5">
                  <h3 className="mb-3 font-bold">Estimated 1RM</h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {estimates.slice(0, 12).map((est, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
                        <span className="text-sm font-bold">{est.exerciseName}</span>
                        <span className="rounded-lg bg-energy/10 px-2.5 py-1 text-sm font-bold text-energy">{est.bestE1rm} kg</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <MetricsDashboard />
          </>
        )}

        {showCompare && photoItems.length >= 2 && (
          <ProgressPhotoCompare photos={photoItems} onClose={() => setShowCompare(false)} />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
