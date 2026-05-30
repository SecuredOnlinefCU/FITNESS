import { Card, CardContent } from '@/components/ui/card';

export function TodayScoreCard({ score = 0 }: { score?: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Today score</p>
        <p className="mt-2 text-5xl font-black tracking-tight">{score}%</p>
        <p className="mt-2 text-sm text-muted-foreground">A simple consistency score based on today’s habits and actions.</p>
      </CardContent>
    </Card>
  );
}
