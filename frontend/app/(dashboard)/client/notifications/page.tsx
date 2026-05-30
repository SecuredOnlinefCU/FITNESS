'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { notificationsApi } from '@/lib/api/modules/notifications';
import { Bell, MessageSquare, Calendar, Settings } from 'lucide-react';

export default function ClientNotificationsPage() {
  const result = useAsyncData(() => notificationsApi.listNotifications(), []);
  const all = result.data?.items ?? [];
  const unread = all.filter((n: any) => !n.openedAt);

  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Notifications" subtitle="Coach updates, reminders, and system alerts in one place." />

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Bell className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unread alerts</p>
                      <p className="text-2xl font-black">{unread.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><MessageSquare className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total notifications</p>
                      <p className="text-2xl font-black">{all.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Calendar className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reminders</p>
                      <p className="text-2xl font-black">{all.filter((n: any) => n.type === 'REMINDER').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {all.length > 0 && (
              <div className="mt-5 space-y-2">
                {all.slice(0, 10).map((n: any) => (
                  <Card key={n.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-bold">{n.title}</p>
                        {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                      </div>
                      {!n.openedAt && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        <Card className="mt-5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black">Preferences</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Configure which notifications you receive and how they are delivered.</p>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
