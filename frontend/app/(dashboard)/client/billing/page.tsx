'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { paymentsApi } from '@/lib/api/modules/payments';
import { toast } from 'sonner';
import { CreditCard, Receipt, Settings, Shield, RefreshCw, XCircle } from 'lucide-react';

export default function ClientBillingPage() {
  const [cancelOpen, setCancelOpen] = useState(false);
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

        {subscription && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black">Subscription status</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Status: <span className="font-bold">{subscription.status}</span>
                </p>
                <button
                  onClick={() => toast.info('Subscription management coming soon')}
                  className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Manage subscription
                </button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-pulse" />
                  <h2 className="text-lg font-black">Cancel subscription</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cancel anytime. You&apos;ll retain access until the end of your billing period.
                </p>
                <button
                  onClick={() => setCancelOpen(true)}
                  className="mt-3 rounded-xl border border-pulse/30 px-4 py-2 text-sm font-bold text-pulse hover:bg-pulse/5 transition"
                >
                  Cancel subscription
                </button>
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently cancel your subscription. You'll retain access until the end of your billing period. Contact support to process the cancellation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                      <AlertDialogAction className="bg-pulse hover:bg-pulse/90" onClick={() => { setCancelOpen(false); toast.info('Contact support to cancel your subscription'); }}>
                        Cancel subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
