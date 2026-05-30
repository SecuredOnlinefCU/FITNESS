import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Camera, ClipboardCheck, Target } from 'lucide-react';

export default function ClientProgressPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Progress" subtitle="Track your body metrics, progress photos, and check-in history." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><TrendingUp className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Body metrics</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Camera className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress photos</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardCheck className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-ins</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Performance trends</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Weight, body fat, and strength progression charts will appear once you log your first metrics.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
