import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare, Repeat, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CoachTasksPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Task builder" subtitle="Assign habits, videos, forms, and reviewable work to clients." />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><CheckSquare className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Task library</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Currently assigned</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Repeat className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Link href="/coach/tasks/review">
          <Card className="mt-5 border-dashed border-primary/30 transition hover:bg-muted">
            <CardContent className="flex items-center justify-center gap-3 p-6">
              <Plus className="h-5 w-5 text-primary" />
              <p className="font-bold text-primary">Create and assign tasks</p>
            </CardContent>
          </Card>
        </Link>
      </DashboardShell>
    </ProtectedRoute>
  );
}
