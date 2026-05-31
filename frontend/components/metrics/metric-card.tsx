'use client';

import type { MetricSummary } from '@/lib/types/domain';
import { MetricSparkline } from '@/components/metrics/metric-sparkline';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Props = {
  metric: MetricSummary;
  sparklineValues: { value: number; recordedAt?: string }[];
};

export function MetricCard({ metric, sparklineValues }: Props) {
  const isPositive = metric.changePercent > 0;
  const isNegative = metric.changePercent < 0;
  const isNeutral = metric.changePercent === 0;

  const accentColor = isPositive
    ? 'var(--flow)'
    : isNegative
      ? 'var(--energy)'
      : 'var(--bone-fade)';

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{metric.label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums text-foreground">
              {metric.count > 0 ? metric.latestValue : '—'}
            </span>
            {metric.unit && (
              <span className="text-xs text-muted-foreground">{metric.unit}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            color: isPositive ? 'var(--flow)' : isNegative ? 'var(--energy)' : 'var(--bone-fade)',
            backgroundColor: isPositive ? 'color-mix(in oklch, var(--flow) 10%, transparent)' : isNegative ? 'color-mix(in oklch, var(--energy) 10%, transparent)' : 'color-mix(in oklch, var(--bone-fade) 10%, transparent)',
          }}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          <span>{isNeutral ? '0%' : `${isPositive ? '+' : ''}${metric.changePercent}%`}</span>
        </div>
      </div>
      <div className="mt-3">
        <MetricSparkline values={sparklineValues} accentColor={accentColor} />
      </div>
    </div>
  );
}
