import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, AlertTriangle, Activity, Users } from 'lucide-react';

export default function CoachIntelligencePage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Coach intelligence" subtitle="AI-powered insights showing which clients need attention and why." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Brain className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Attention queue</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><AlertTriangle className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk flags</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Activity className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Recovery signals</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Intelligence overview</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Coach intelligence surfaces the highest-signal items across your client roster — adherence drops, missed check-ins, recovery warnings, and payment risks — so you know exactly where to focus.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
