import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

type HealthScoreItem = {
  id: string;
  clientUserId: string;
  score: number;
  healthStatus: string;
  adherenceScore: number;
  progressScore: number;
  engagementScore: number;
  paymentScore: number;
  clientUser?: { id: string; firstName: string | null; lastName: string | null; email: string } | null;
};

export function ClientHealthScoreCard({ item }: { item: HealthScoreItem }) {
  const color = item.healthStatus === 'CRITICAL' ? 'text-pulse' : item.healthStatus === 'AT_RISK' ? 'text-energy' : item.healthStatus === 'WATCH' ? 'text-energy' : 'text-flow';
  const name = item.clientUser ? `${item.clientUser.firstName || ''} ${item.clientUser.lastName || ''}`.trim() || item.clientUser.email : item.clientUserId;

  return (
    <Link href={`/coach/clients/${item.clientUserId}`}>
      <Card className="transition hover:border-primary/30 hover:bg-primary/5 cursor-pointer">
        <CardContent className="p-5">
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-black">{name}</p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-black ${color}`}>{item.score}</p>
              <p className="text-xs font-bold text-muted-foreground">{item.healthStatus}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-4">
            <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.adherenceScore}</p><p>Adherence</p></div>
            <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.progressScore}</p><p>Progress</p></div>
            <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.engagementScore}</p><p>Engagement</p></div>
            <div className="rounded-2xl bg-muted p-3"><p className="font-black text-foreground">{item.paymentScore}</p><p>Payment</p></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
