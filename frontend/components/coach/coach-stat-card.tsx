import { Card, CardContent } from '@/components/ui/card';

export function CoachStatCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
        {trend ? <p className="mt-1 text-xs font-semibold text-primary">{trend}</p> : null}
      </CardContent>
    </Card>
  );
}
