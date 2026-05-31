'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';
import { CheckSquare, Video, MessageSquare, Clock } from 'lucide-react';

export default function ClientTasksPage() {
  const result = useAsyncData(() => tasksApi.listTasks(), []);
  const tasks = result.data?.items ?? [];

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Tasks" subtitle="Complete assignments, upload videos, and review coach feedback." />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary">              <CheckSquare className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Open tasks</p>
                    <p className="text-2xl font-black">{tasks.filter((t: { status: string }) => t.status === 'assigned' || !t.status).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Clock className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-black">{tasks.filter((t: { submissions?: { reviewStatus: string }[] }) => t.submissions?.some((s: { reviewStatus: string }) => s.reviewStatus === 'PENDING')).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><MessageSquare className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Feedback</p>
                    <p className="text-2xl font-black">{tasks.filter((t: { submissions?: { reviewStatus: string }[] }) => t.submissions?.some((s: { reviewStatus: string }) => s.reviewStatus === 'APPROVED' || s.reviewStatus === 'REJECTED')).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black">Video submissions</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Record and submit movement videos for coach review and technique feedback.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-black">Coach feedback</h2>
              <p className="mt-2 text-sm text-muted-foreground">Review feedback from your coach on submitted tasks and videos.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
