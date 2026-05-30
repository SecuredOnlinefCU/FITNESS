'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { apiFetch } from '@/lib/api/client';
import { Megaphone, Newspaper, Shield, MessageSquare } from 'lucide-react';

export default function CoachFeedPage() {
  const programs = useAsyncData(() => programsApi.listPrograms(), []);
  const programId = (programs.data?.items ?? [])[0]?.id;
  const posts = useAsyncData(
    () => programId ? apiFetch<{ items: any[] }>(`/api/feed/program/${programId}`) : Promise.resolve({ items: [] }),
    [programId],
  );
  const reports = useAsyncData(() => apiFetch<{ items: any[] }>('/api/moderation/reports'), []);
  const allPosts = posts.data?.items ?? [];

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Feed management" subtitle="Post announcements, review reports, and manage community content." />

        {programs.loading || posts.loading || reports.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : posts.error ? (
          <ErrorState message={posts.error} onRetry={() => { posts.reload(); reports.reload(); }} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Megaphone className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Announcements</p>
                    <p className="text-2xl font-black">{allPosts.filter((p: any) => p.postType === 'ANNOUNCEMENT').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Newspaper className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posts</p>
                    <p className="text-2xl font-black">{allPosts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Shield className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reports</p>
                    <p className="text-2xl font-black">{reports.data?.items?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Community feed</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Post program-wide announcements, share wins, and moderate community content from one place.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
