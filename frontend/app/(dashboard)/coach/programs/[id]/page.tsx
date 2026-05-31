'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { Layers, Users, FileText, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const result = useAsyncData(() => programsApi.getProgram(id), [id]);
  const program = result.data;

  async function handleDelete() {
    if (!confirm('Delete this program and all associated content?')) return;
    await programsApi.deleteProgram(id);
    router.push('/coach/programs');
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="mb-4">
          <Link href="/coach/programs" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back to programs
          </Link>
        </div>

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : program ? (
          <>
            <CoachPageHeader title={program.name ?? 'Program'} subtitle={program.description ?? 'No description'} />

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Layers className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="text-lg font-black">{program.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Users className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Members</p>
                      <p className="text-lg font-black">{program.memberships?.length ?? 0}</p>
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
                      <p className="text-lg font-black">{program.guidelines ? 'Set' : 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {program.memberships && program.memberships.length > 0 && (
              <Card className="mt-5">
                <CardContent className="p-5">
                  <h2 className="text-lg font-black">Members</h2>
                  <div className="mt-3 space-y-2">
                    {program.memberships.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                        <div>
                          <p className="font-bold">{m.clientUser?.name ?? 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{m.clientUser?.email}</p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {program.guidelines && (
              <Card className="mt-4">
                <CardContent className="p-5">
                  <h2 className="text-lg font-black">Guidelines</h2>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{program.guidelines.contentMd}</p>
                </CardContent>
              </Card>
            )}

            <div className="mt-5 flex gap-3">
              <Link href={`/coach/programs/${id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"><Pencil className="h-4 w-4" />Edit program</Link>
              <button onClick={handleDelete} className="inline-flex items-center gap-2 rounded-xl border border-pulse/30 px-5 py-2.5 text-sm font-bold text-pulse hover:bg-pulse/5 transition"><Trash2 className="h-4 w-4" />Delete</button>
            </div>
          </>
        ) : null}
      </DashboardShell>
    </ProtectedRoute>
  );
}
