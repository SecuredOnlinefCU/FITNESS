import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Target, Droplets, Apple } from 'lucide-react';

export default function ClientNutritionPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Nutrition" subtitle="Follow your plan, log meals, and track macro consistency." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Apple className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Meals logged</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Target className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Macro adherence</p>
                  <p className="text-2xl font-black">--%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Droplets className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Hydration</p>
                  <p className="text-2xl font-black">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
