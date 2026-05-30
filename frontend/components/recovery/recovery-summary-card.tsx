'use client';

import { Moon, Activity, Footprints } from 'lucide-react';
import { useRecoveryToday } from '@/hooks/recovery/use-recovery-today';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';

export function RecoverySummaryCard() {
  const recovery = useRecoveryToday();
  if (recovery.loading) return <CardSkeleton />;
  const item = recovery.data?.items?.[0];
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-xl font-black">Recovery today</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-muted p-4"><Moon className="mb-2 h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Sleep</p><p className="font-black">{item?.sleepMinutes ? `${Math.round(item.sleepMinutes / 60)}h` : 'No data'}</p></div>
          <div className="rounded-2xl bg-muted p-4"><Activity className="mb-2 h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Readiness</p><p className="font-black">{item?.readinessScore ?? 'No data'}</p></div>
          <div className="rounded-2xl bg-muted p-4"><Footprints className="mb-2 h-4 w-4 text-primary" /><p className="text-sm text-muted-foreground">Steps</p><p className="font-black">{item?.steps ?? 'No data'}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
