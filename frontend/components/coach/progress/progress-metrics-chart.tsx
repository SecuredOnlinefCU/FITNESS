'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { progressApi } from '@/lib/api/modules/progress';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function ProgressMetricsChart({ clientUserId }: { clientUserId?: string }) {
  const result = useAsyncData(() => progressApi.listMetrics(clientUserId), [clientUserId]);
  const items = result.data?.items ?? [];
  const types = [...new Set(items.map((m: any) => m.metricType))];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Metric trends</h2>
        </div>
        {result.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading metrics...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No metrics recorded yet for this client.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {types.slice(0, 4).map(type => {
              const entries = items.filter((m: any) => m.metricType === type).slice(-10);
              const max = Math.max(...entries.map((e: any) => e.value));
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{entries[entries.length - 1]?.value}{entries[entries.length - 1]?.unit ?? ''}</span>
                  </div>
                  <div className="mt-1 flex items-end gap-0.5 h-16">
                    {entries.map((e: any, i: number) => {
                      const h = max > 0 ? (e.value / max) * 100 : 0;
                      const isLatest = i === entries.length - 1;
                      return (
                        <div key={e.id} className="flex-1 flex flex-col items-center gap-0.5" title={`${e.value}${e.unit ?? ''} - ${new Date(e.recordedAt).toLocaleDateString()}`}>
                          <div className={`w-full rounded-sm ${isLatest ? 'bg-primary' : 'bg-primary/30'}`} style={{ height: `${Math.max(h, 5)}%`, minHeight: '4px' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
