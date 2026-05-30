import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Receipt, Settings, Shield } from 'lucide-react';

export default function ClientBillingPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Billing" subtitle="Manage your subscription, view payment history, and update payment methods." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><CreditCard className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active package</p>
                  <p className="text-2xl font-black">None</p>
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
                  <p className="text-2xl font-black">0</p>
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
                  <p className="text-2xl font-black">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
