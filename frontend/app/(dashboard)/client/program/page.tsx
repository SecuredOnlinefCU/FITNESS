'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { BookOpen, MessageSquare, FileText, Calendar } from 'lucide-react';

export default function ClientProgramPage() {
  const result = useAsyncData(() => programsApi.listPrograms(), []);
  const membership = result.data?.items?.[0];
  const program = membership?.program;

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Your program" subtitle="Your selected coaching program, guidelines, and coach context." />

        {result.loading ? (
          <CardSkeleton />
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-muted p-3 text-primary"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Active program</p>
                  <p className="text-xl font-black">{program?.name || 'No program assigned'}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {program?.description || 'Your coach will assign a program. Once assigned, all training, nutrition, and tasks will sync here.'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Guidelines</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Program rules, expectations, and coach notes.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Coach notes</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Personalized coaching notes for your program.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Schedule</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Training schedule and program timeline.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
