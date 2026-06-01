'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { analyticsApi } from '@/lib/api/modules/analytics';
import { Users, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/types/domain';

const AnalyticsBars3D = dynamic(() => import('@/components/3d/analytics-bars'), { ssr: false, loading: () => <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" /> });

function CompactNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const display = useMemo(() => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

function MiniBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-xs font-bold">{value}</span>
    </div>
  );
}

function TrendSparkline({ data, color }: { data: { month: string; value: number }[]; color: string }) {
  if (data.length < 2) return <div className="h-16 text-xs text-muted-foreground">Insufficient data</div>;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 240;
  const h = 56;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" points={points} />
    </svg>
  );
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#38bdf8',
  low: '#8a907c',
};

export default function CoachAnalyticsPage() {
  const result = useAsyncData(() => analyticsApi.summary(), []);

  const data = result.data;
  const loading = result.loading;
  const error = result.error;

  const barData = useMemo(() => {
    if (!data) return [];
    const maxVal = Math.max(data.clients.total, data.clients.active, Math.round(data.revenue.mrr / 100), data.riskFlags.total, data.completionRate, 1);
    return [
      { label: 'Clients', value: data.clients.total, color: '#d7ff2f', maxValue: maxVal },
      { label: 'Active', value: data.clients.active, color: '#38bdf8', maxValue: maxVal },
      { label: 'MRR ($)', value: Math.round(data.revenue.mrr / 100), color: '#f97316', maxValue: maxVal },
      { label: 'Flags', value: data.riskFlags.total, color: '#ef4444', maxValue: maxVal },
      { label: 'Complete%', value: data.completionRate, color: '#a78bfa', maxValue: maxVal },
    ];
  }, [data]);

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Analytics" subtitle="3D-powered business intelligence — revenue, clients, adherence at a glance." />

        {loading ? (
          <div className="space-y-5"><CardSkeleton /><div className="grid gap-4 md:grid-cols-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div></div>
        ) : error ? (
          <ErrorState message={error} onRetry={result.reload} />
        ) : !data ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No analytics data available yet.</CardContent></Card>
        ) : (
          <div className="space-y-6">
            <AnalyticsBars3D data={barData} />

            <div className="grid gap-4 md:grid-cols-4">
              <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total clients</p><p className="text-2xl font-black"><CompactNumber value={data.clients.total} /></p></div></div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-flow/10 p-3"><Activity className="h-5 w-5 text-flow" /></div><div><p className="text-xs text-muted-foreground">Active (30d)</p><p className="text-2xl font-black"><CompactNumber value={data.clients.active} /></p></div></div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-energy/10 p-3"><DollarSign className="h-5 w-5 text-energy" /></div><div><p className="text-xs text-muted-foreground">MRR</p><p className="text-2xl font-black">${(data.revenue.mrr / 100).toFixed(0)}</p></div></div></CardContent></Card>
              <Card><CardContent className="p-5"><div className="flex items-center gap-3"><div className="rounded-2xl bg-pulse/10 p-3"><AlertTriangle className="h-5 w-5 text-pulse" /></div><div><p className="text-xs text-muted-foreground">Risk flags</p><p className="text-2xl font-black"><CompactNumber value={data.riskFlags.total} /></p></div></div></CardContent></Card>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Revenue trend</h3>
                  {data.revenue.revenueByMonth.length > 0 ? (
                    <TrendSparkline data={data.revenue.revenueByMonth.map((r) => ({ month: r.month, value: r.amountCents / 100 }))} color="#f97316" />
                  ) : (
                    <p className="text-sm text-muted-foreground">No revenue data yet.</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">Total revenue: ${(data.revenue.totalRevenue / 100).toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Client growth</h3>
                  {data.clients.growthByMonth.length > 0 ? (
                    <TrendSparkline data={data.clients.growthByMonth.map((g) => ({ month: g.month, value: g.count }))} color="#d7ff2f" />
                  ) : (
                    <p className="text-sm text-muted-foreground">No client growth data yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Adherence</h3>
                  <p className="mb-3 text-3xl font-black">{data.adherence.avgAdherence}%</p>
                  <div className="space-y-1.5">
                    <MiniBar value={data.adherence.distribution.high} max={data.clients.total} color="#d7ff2f" label="High (6+)" />
                    <MiniBar value={data.adherence.distribution.medium} max={data.clients.total} color="#38bdf8" label="Medium (3-5)" />
                    <MiniBar value={data.adherence.distribution.low} max={data.clients.total} color="#ef4444" label="Low (0-2)" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Momentum</h3>
                  <p className="mb-3 text-3xl font-black">{data.momentum.averageScore}</p>
                  <div className="space-y-1.5">
                    <MiniBar value={data.momentum.distribution.high} max={data.clients.total} color="#d7ff2f" label="High (70+)" />
                    <MiniBar value={data.momentum.distribution.medium} max={data.clients.total} color="#38bdf8" label="Medium (40-69)" />
                    <MiniBar value={data.momentum.distribution.low} max={data.clients.total} color="#ef4444" label="Low (0-39)" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Risk flags</h3>
                  <p className="mb-3 text-3xl font-black">{data.riskFlags.total}</p>
                  <div className="space-y-1.5">
                    <MiniBar value={data.riskFlags.bySeverity.critical} max={data.riskFlags.total || 1} color="#ef4444" label="Critical" />
                    <MiniBar value={data.riskFlags.bySeverity.high} max={data.riskFlags.total || 1} color="#f97316" label="High" />
                    <MiniBar value={data.riskFlags.bySeverity.medium} max={data.riskFlags.total || 1} color="#38bdf8" label="Medium" />
                    <MiniBar value={data.riskFlags.bySeverity.low} max={data.riskFlags.total || 1} color="#8a907c" label="Low" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {data.topExercises.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="mb-3 font-black">Top exercises</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {data.topExercises.map((e) => (
                      <div key={e.exerciseName} className="rounded-xl bg-muted p-3 text-center">
                        <p className="text-xs text-muted-foreground">{e.exerciseName}</p>
                        <p className="text-lg font-black">{e.count}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
