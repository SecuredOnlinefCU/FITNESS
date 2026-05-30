import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, DollarSign, Clock, ShieldAlert } from 'lucide-react';

export default function CoachRiskSignalsPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Risk signals" subtitle="Scan for low adherence, stalled progress, and payment or access risks." />

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-pulse" />
                <p className="text-xs text-muted-foreground">Low adherence</p>
              </div>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-energy" />
                <p className="text-xs text-muted-foreground">Stalled progress</p>
              </div>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-pulse" />
                <p className="text-xs text-muted-foreground">Payment issues</p>
              </div>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-energy" />
                <p className="text-xs text-muted-foreground">Access risks</p>
              </div>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-energy" />
              <h2 className="text-lg font-black">Risk scan panel</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Run scans to detect clients with declining adherence, stalled progress, or billing issues that need your attention.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
