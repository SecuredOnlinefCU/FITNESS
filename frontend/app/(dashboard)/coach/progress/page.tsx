import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Camera, ClipboardCheck, BarChart3 } from 'lucide-react';

export default function CoachProgressPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Progress review" subtitle="Review client metrics, progress photos, and check-in data across your roster." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><TrendingUp className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Metric trends</p>
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
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Progress overview</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Client metric trends, photo timelines, and check-in history across your entire roster will appear here as data is recorded.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
