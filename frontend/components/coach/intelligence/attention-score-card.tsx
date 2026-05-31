import { Card, CardContent } from '@/components/ui/card';

export function AttentionScoreCard({ item }: { item: any }) {
  const color = item.severity === 'CRITICAL' ? 'text-pulse' : item.severity === 'HIGH' ? 'text-energy' : item.severity === 'MEDIUM' ? 'text-energy' : 'text-flow';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-black">{item.clientUserId}</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${color}`}>{item.score}</p>
            <p className="text-xs font-bold text-muted-foreground">{item.severity}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.missedCheckins}</p><p>Missed</p></div>
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.riskFlagsOpen}</p><p>Flags</p></div>
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.inactiveDays}</p><p>Inactive days</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
