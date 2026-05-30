import { Watch, Moon, Footprints } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function RecoverySignalCard({ snapshot }: { snapshot?: any }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Watch className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black">Recovery signals</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-muted p-4"><Moon className="mb-2 h-4 w-4 text-primary" /><p className="text-sm text-slate-500">Sleep</p><p className="font-black">{snapshot?.sleepMinutes ? `${Math.round(snapshot.sleepMinutes / 60)}h` : 'Not synced'}</p></div>
          <div className="rounded-2xl bg-muted p-4"><Footprints className="mb-2 h-4 w-4 text-primary" /><p className="text-sm text-slate-500">Steps</p><p className="font-black">{snapshot?.steps ?? 'Not synced'}</p></div>
          <div className="rounded-2xl bg-muted p-4"><p className="text-sm text-slate-500">Readiness</p><p className="font-black">{snapshot?.readinessScore ?? 'Not synced'}</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
