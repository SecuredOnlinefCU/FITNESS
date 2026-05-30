import { Card, CardContent } from '@/components/ui/card';

export function RiskSignalExplainer() {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-xl font-black">Signal definitions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-muted p-4"><p className="font-black">Low adherence</p><p className="mt-1 text-sm text-slate-500">Recent task and habit completion is tracking below the configured threshold.</p></div>
          <div className="rounded-2xl bg-muted p-4"><p className="font-black">Stalled progress</p><p className="mt-1 text-sm text-slate-500">Client has limited recent check-ins, metrics, or progress updates.</p></div>
          <div className="rounded-2xl bg-muted p-4"><p className="font-black">Payment/access risk</p><p className="mt-1 text-sm text-slate-500">Subscription or access status may interrupt coaching continuity.</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
