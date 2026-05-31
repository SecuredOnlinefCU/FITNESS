import { Card, CardContent } from '@/components/ui/card';

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Your subscription is active', color: 'text-signal' },
  trialing: { label: 'Trial period — ends soon', color: 'text-energy' },
  past_due: { label: 'Payment is past due — update billing', color: 'text-pulse' },
  canceled: { label: 'Subscription canceled', color: 'text-bone-fade' },
  unpaid: { label: 'Subscription unpaid', color: 'text-pulse' },
  NONE: { label: 'No active subscription', color: 'text-bone-fade' },
};

export function BillingStatusBanner({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: 'Unknown status', color: 'text-bone-fade' };
  return (
    <Card className="border-line">
      <CardContent className="p-4">
        <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
      </CardContent>
    </Card>
  );
}
