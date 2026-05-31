import { Card, CardContent } from '@/components/ui/card';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

export function PackageCard({ pkg }: { pkg: { id: string; title: string; priceCents: number; currency?: string; billingType?: string } }) {
  return (
    <Card className="border-line transition hover:border-primary/30">
      <CardContent className="p-4">
        <p className="font-black">{pkg.title}</p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(pkg.priceCents, pkg.currency ?? 'USD')}
          {pkg.billingType ? ` / ${pkg.billingType.replace('_', ' ').toLowerCase()}` : ''}
        </p>
      </CardContent>
    </Card>
  );
}
