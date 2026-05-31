'use client';

import { useState } from 'react';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { progressApi } from '@/lib/api/modules/progress';
import { MetricCard } from '@/components/metrics/metric-card';
import { ErrorState } from '@/components/states/error-state';
import { CardSkeleton } from '@/components/states/skeleton';
import { Activity, Filter } from 'lucide-react';

type Props = {
  clientUserId?: string;
};

const RANGE_OPTIONS = [
  { label: '1 week', value: '1w', days: 7 },
  { label: '4 weeks', value: '4w', days: 28 },
  { label: '12 weeks', value: '12w', days: 84 },
  { label: 'All', value: 'all', days: 0 },
] as const;

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'body', label: 'Body' },
  { key: 'measurement', label: 'Measurements' },
  { key: 'vitals', label: 'Vitals' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'nutrition', label: 'Nutrition' },
];

export function MetricsDashboard({ clientUserId }: Props) {
  const [range, setRange] = useState<string>('4w');
  const [category, setCategory] = useState<string>('all');

  const summary = useAsyncData(() => progressApi.getMetricsSummary(clientUserId), [clientUserId]);

  const selectedRange = RANGE_OPTIONS.find(r => r.value === range);
  const fromDate = selectedRange && selectedRange.days > 0
    ? new Date(Date.now() - selectedRange.days * 86400000).toISOString()
    : undefined;

  const sparklineQueries = useAsyncData(
    () => {
      if (!summary.data?.items.length) return Promise.resolve({ items: [] as { metricType: string; values: { value: number; recordedAt?: string }[] }[] });
      const metrics = summary.data.items;
      return Promise.all(
        metrics.map(m =>
          progressApi.listMetrics(clientUserId, { metricType: m.metricType, from: fromDate, limit: 30 })
            .then(res => ({ metricType: m.metricType, values: res.items.map(e => ({ value: e.value, recordedAt: e.recordedAt })) }))
        )
      ).then(results => ({ items: results }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary.data, fromDate, clientUserId],
  );

  const filtered = summary.data?.items.filter(m => category === 'all' || m.category === category) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Body metrics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1 rounded-lg bg-muted p-0.5">
            {RANGE_OPTIONS.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${range === r.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >{r.label}</button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-0.5">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${category === c.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >{c.label}</button>
            ))}
          </div>
        </div>
      </div>

      {summary.loading || sparklineQueries.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : summary.error ? (
        <ErrorState message={summary.error} onRetry={summary.reload} />
      ) : summary.data?.items.length === 0 ? (
        <div className="rounded-2xl bg-muted p-10 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-bold text-muted-foreground">No metrics recorded yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Log your first body measurement, weight, or health metric to start tracking progress.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(m => {
            const sparkData = sparklineQueries.data?.items.find(s => s.metricType === m.metricType);
            return <MetricCard key={m.metricType} metric={m} sparklineValues={sparkData?.values ?? []} />;
          })}
        </div>
      )}
    </div>
  );
}
