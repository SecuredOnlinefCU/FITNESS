'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { trainingApi } from '@/lib/api/modules/training';
import { Dumbbell, Library, ClipboardList, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CoachWorkoutsPage() {
  const exercises = useAsyncData(() => trainingApi.listExercises(), []);

  const loading = exercises.loading;
  const error = exercises.error;

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Workout library" subtitle="Create, organize, and assign training sessions." actionLabel="Build workout" actionHref="/coach/workouts/builder" />

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { exercises.reload(); workouts.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Library className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Workout library</p>
                    <p className="text-2xl font-black">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Dumbbell className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exercise library</p>
                    <p className="text-2xl font-black">{exercises.data?.items?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><ClipboardList className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assignments</p>
                    <p className="text-2xl font-black">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Link href="/coach/workouts/builder">
          <Card className="mt-5 border-dashed border-primary/30 transition hover:bg-muted">
            <CardContent className="flex items-center justify-center gap-3 p-6">
              <Plus className="h-5 w-5 text-primary" />
              <p className="font-bold text-primary">Create your first workout</p>
            </CardContent>
          </Card>
        </Link>
      </DashboardShell>
    </ProtectedRoute>
  );
}
