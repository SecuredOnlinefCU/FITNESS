import { Card, CardContent } from '@/components/ui/card';

export function ClientHealthScoreCard({ item }: { item: any }) {
  const color = item.healthStatus === 'CRITICAL' ? 'text-red-600' : item.healthStatus === 'AT_RISK' ? 'text-orange-600' : item.healthStatus === 'WATCH' ? 'text-yellow-600' : 'text-emerald-600';

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Client</p>
            <p className="font-black">{item.clientUserId}</p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-black ${color}`}>{item.score}</p>
            <p className="text-xs font-bold text-slate-500">{item.healthStatus}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.adherenceScore}</p><p>Adherence</p></div>
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.progressScore}</p><p>Progress</p></div>
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.engagementScore}</p><p>Engagement</p></div>
          <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.paymentScore}</p><p>Payment</p></div>
        </div>
      </CardContent>
    </Card>
  );
}
