'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { Layers, FileText, Plus, Clock } from 'lucide-react';
import Link from 'next/link';

export default function CoachProgramsPage() {
  const result = useAsyncData(() => programsApi.listPrograms(), []);
  const programs = result.data?.items ?? [];

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Programs" subtitle="Manage coaching programs, guidelines, and program membership." actionLabel="Create program" actionHref="/coach/programs/new" />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Layers className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active programs</p>
                    <p className="text-2xl font-black">{programs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Clock className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Draft programs</p>
                    <p className="text-2xl font-black">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guidelines</p>
                    <p className="text-2xl font-black">{programs.filter((p: any) => p.description).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {programs.length === 0 && (
          <Link href="/coach/programs/new">
            <Card className="mt-5 border-dashed border-primary/30 transition hover:bg-muted">
              <CardContent className="flex items-center justify-center gap-3 p-6">
                <Plus className="h-5 w-5 text-primary" />
                <p className="font-bold text-primary">Create your first program</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
