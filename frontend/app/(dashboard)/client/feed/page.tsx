'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { programsApi } from '@/lib/api/modules/programs';
import { apiFetch } from '@/lib/api/client';
import { Newspaper, Megaphone, Bookmark, MessageSquare } from 'lucide-react';

export default function ClientFeedPage() {
  const programs = useAsyncData(() => programsApi.listPrograms(), []);
  const programId = (programs.data?.items ?? [])[0]?.id;
  const posts = useAsyncData(
    () => programId ? apiFetch<{ items: any[] }>(`/api/feed/program/${programId}`) : Promise.resolve({ items: [] }),
    [programId],
  );
  const allPosts = posts.data?.items ?? [];

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Community feed" subtitle="Program announcements, coach posts, and community updates." />

        {programs.loading || posts.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : posts.error ? (
          <ErrorState message={posts.error} onRetry={posts.reload} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Newspaper className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Latest posts</p>
                    <p className="text-2xl font-black">{allPosts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <div className="rounded-2xl bg-muted p-3 text-primary"><Bookmark className="h-5 w-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saved</p>
                    <p className="text-2xl font-black">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {allPosts.length > 0 && (
          <div className="mt-5 space-y-3">
            {allPosts.slice(0, 10).map((post: any) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  <p className="font-bold">{post.title || 'Untitled post'}</p>
                  {post.body && <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Community feed</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Coach announcements and program-wide posts will appear here once your program is active.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
