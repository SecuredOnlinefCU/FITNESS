'use client';

import { AlertTriangle } from 'lucide-react';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { workoutWarningsApi } from '@/lib/api/modules/workout-warnings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/states/skeleton';

export function AdaptiveWorkoutWarningList() {
  const warnings = useAsyncData(() => workoutWarningsApi.list(), []);
  async function generate() { await workoutWarningsApi.generate(); await warnings.reload(); }
  if (warnings.loading) return <ListSkeleton rows={3} />;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Adaptive workout warnings</h2><Button onClick={generate}>Generate warnings</Button></div>
        <div className="space-y-3">
          {(warnings.data?.items || []).length ? warnings.data!.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 text-primary" /><div><p className="font-black">{item.title}</p><p className="text-sm text-muted-foreground">{item.body}</p><p className="mt-1 text-xs font-bold text-muted-foreground">{item.warningType} • {item.severity}</p></div></div></div>
          )) : <p className="text-sm text-muted-foreground">No active workout warnings.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
