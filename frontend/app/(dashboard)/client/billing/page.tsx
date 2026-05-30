'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { paymentsApi } from '@/lib/api/modules/payments';
import { CreditCard, Receipt, Settings, Shield } from 'lucide-react';

export default function ClientBillingPage() {
  const subs = useAsyncData(() => paymentsApi.listSubscriptions(), []);
  const payments = useAsyncData(() => paymentsApi.listPayments(), []);

  const loading = subs.loading || payments.loading;
  const error = subs.error || payments.error;
  const subscription = subs.data?.items?.[0];
  const paymentCount = payments.data?.items?.length ?? 0;

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Billing" subtitle="Manage your subscription, view payment history, and update payment methods." />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { subs.reload(); payments.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><CreditCard className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active package</p>
                    <p className="text-2xl font-black">{subscription?.package?.title ?? 'None'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Receipt className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment history</p>
                    <p className="text-2xl font-black">{paymentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Settings className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment method</p>
                    <p className="text-2xl font-black">{subscription?.paymentMethod ?? '--'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Billing & access</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Your subscription and payment information managed securely. All transactions are processed through Stripe.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
