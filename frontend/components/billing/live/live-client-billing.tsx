'use client';

import { paymentsApi } from '@/lib/api/modules/payments';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { BillingStatusBanner } from '@/components/billing/billing-status-banner';
import { PackageCard } from '@/components/billing/package-card';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton, ListSkeleton } from '@/components/states/skeleton';
import { EmptyState } from '@/components/states/empty-state';
import { ErrorState } from '@/components/states/error-state';

async function loadBilling() {
  const [subscriptions, payments, packages] = await Promise.allSettled([
    paymentsApi.listSubscriptions(),
    paymentsApi.listPayments(),
    paymentsApi.listPackages(),
  ]);

  const subs = subscriptions.status === 'fulfilled' ? subscriptions.value.items : [];
  const paymentItems = payments.status === 'fulfilled' ? payments.value.items : [];
  const packageItems = packages.status === 'fulfilled' ? packages.value.items : [];

  return { subscriptions: subs, payments: paymentItems, packages: packageItems };
}

export function LiveClientBilling() {
  const result = useAsyncData(loadBilling, []);

  if (result.loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  const active = result.data?.subscriptions?.[0];
  const status = active?.status || 'NONE';

  return (
    <div className="space-y-4">
      <BillingStatusBanner status={status} />

      <Card>
        <CardContent className="p-5">
          <h2 className="text-xl font-black">Available packages</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {result.data?.packages?.length ? result.data.packages.map((pkg: any) => <PackageCard key={pkg.id} pkg={pkg} />) : (
              <div className="md:col-span-2"><EmptyState title="No packages available" description="Your coach has not published active packages yet." /></div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-xl font-black">Payment history</h2>
          {result.data?.payments?.length ? (
            <div className="mt-4 space-y-3">
              {result.data.payments.map((payment: any) => (
                <div key={payment.id} className="rounded-2xl border border-border p-4 text-sm">
                  <p className="font-bold">{payment.status}</p>
                  <p className="text-slate-500">{payment.currency?.toUpperCase()} {(payment.amountCents / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : <p className="mt-2 text-sm text-slate-500">No payment history yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
