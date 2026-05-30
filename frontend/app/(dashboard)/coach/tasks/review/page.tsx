'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { tasksApi } from '@/lib/api/modules/tasks';

export default function CoachTasksReviewPage() {
  const result = useAsyncData(() => tasksApi.listTasks(), []);
  const tasks = result.data?.items ?? [];
  const submissions = tasks.flatMap((t: any) => t.assignments?.flatMap((a: any) => a.submissions ?? []) ?? []);

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Task review" subtitle="Review client submissions and send feedback." />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold">Pending submissions</h2>
                <p className="mt-4 text-3xl font-black">{submissions.filter((s: any) => s.status === 'SUBMITTED').length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Awaiting your review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold">Video reviews</h2>
                <p className="mt-4 text-3xl font-black">{submissions.filter((s: any) => s.submissionType === 'VIDEO').length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Submitted for technique review</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <h2 className="font-bold">Feedback history</h2>
                <p className="mt-4 text-3xl font-black">{submissions.filter((s: any) => s.status === 'REVIEWED').length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Previously reviewed</p>
              </CardContent>
            </Card>
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
