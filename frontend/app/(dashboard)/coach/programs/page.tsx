'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { Layers, FileText, Users, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CoachProgramsPage() {
  const result = useAsyncData(() => programsApi.listPrograms(), []);
  const programs = result.data?.items ?? [];

  async function handleDelete(id: string) {
    if (!confirm('Delete this program and all associated content?')) return;
    await programsApi.deleteProgram(id);
    result.reload();
  }

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
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Users className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total members</p>
                    <p className="text-2xl font-black">{programs.reduce((s: number, p: any) => s + (p.memberships?.length ?? 0), 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><FileText className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">With guidelines</p>
                    <p className="text-2xl font-black">{programs.filter((p: any) => p.description).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {programs.length === 0 && !result.loading ? (
          <Link href="/coach/programs/new">
            <Card className="mt-5 border-dashed border-primary/30 transition hover:bg-muted">
              <CardContent className="flex items-center justify-center gap-3 p-6">
                <Plus className="h-5 w-5 text-primary" />
                <p className="font-bold text-primary">Create your first program</p>
              </CardContent>
            </Card>
          </Link>
        ) : programs.length > 0 ? (
          <div className="mt-5 space-y-3">
            <h3 className="text-lg font-black">Your programs</h3>
            {programs.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{p.name}</p>
                    {p.description && <p className="mt-0.5 text-sm text-muted-foreground truncate">{p.description}</p>}
                    <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                      <span>{p.memberships?.length ?? 0} members</span>
                      <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <Link href={`/coach/programs/${p.id}`} className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition" title="View program"><Eye className="h-4 w-4" /></Link>
                    <Link href={`/coach/programs/${p.id}/edit`} className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition" title="Edit program"><Pencil className="h-4 w-4" /></Link>
                    <button className="rounded-xl p-2 text-sm text-muted-foreground hover:bg-muted hover:text-pulse transition" onClick={() => handleDelete(p.id)} title="Delete program"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </DashboardShell>
    </ProtectedRoute>
  );
}
