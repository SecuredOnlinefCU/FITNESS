'use client';

import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { workoutWarningsApi } from '@/lib/api/modules/workout-warnings';
import { messagingApi } from '@/lib/api/modules/messaging';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { MessageSquare, AlertTriangle, Bell, Activity, Eye } from 'lucide-react';

async function loadCoachHome() {
  const [queue, riskFlagsResult, warnings, threads] = await Promise.allSettled([
    coachIntelligenceApi.attentionQueue().catch(() => ({ items: [] })),
    coachIntelligenceApi.riskFlags().catch(() => ({ items: [] })),
    workoutWarningsApi.list().catch(() => ({ items: [] })),
    messagingApi.listThreads().catch(() => ({ items: [] })),
  ]);

  const queueItems = queue.status === 'fulfilled' ? queue.value.items : [];
  const riskFlagItems = riskFlagsResult.status === 'fulfilled' ? riskFlagsResult.value.items : [];
  const warningItems = warnings.status === 'fulfilled' ? warnings.value.items : [];
  const threadItems = threads.status === 'fulfilled' ? threads.value.items : [];

  const activeClients = new Set(threadItems.map((t: any) => t.clientUserId)).size;
  const unreadCount = threadItems.filter((t: any) => {
    const msgs = t.messages || [];
    return msgs.length > 0 && msgs[msgs.length - 1]?.senderUserId !== 'coach';
  }).length;

  return {
    activeClients,
    dueCheckins: queueItems.filter((i: any) => i.missedCheckins > 0).length,
    unread: unreadCount,
    riskFlags: riskFlagItems.length,
    recoveryWarnings: warningItems.length,
    queueItems,
    riskFlagItems,
    warningItems,
  };
}

export function LiveCoachHome() {
  const result = useAsyncData(loadCoachHome, []);

  if (result.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (result.error) return <ErrorState message={result.error} onRetry={result.reload} />;

  const data = result.data!;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active clients</p>
            <p className="mt-1 text-2xl font-black">{data.activeClients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Due check-ins</p>
            <p className="mt-1 text-2xl font-black">{data.dueCheckins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Unread</p>
            <p className="mt-1 text-2xl font-black">{data.unread}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Risk flags</p>
            <p className="mt-1 text-2xl font-black text-energy">{data.riskFlags}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Recovery warnings</p>
            <p className="mt-1 text-2xl font-black text-flow">{data.recoveryWarnings}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Attention queue</h2>
            </div>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, title: 'Unread client messages', count: String(data.unread) },
                { icon: AlertTriangle, title: 'Risk flags requiring review', count: String(data.riskFlags) },
                { icon: Bell, title: 'Overdue check-ins', count: String(data.dueCheckins) },
                { icon: Activity, title: 'Recovery warnings', count: String(data.recoveryWarnings) },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center justify-between rounded-2xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                      <p className="font-bold">{item.title}</p>
                    </div>
                    <p className="text-2xl font-black">{item.count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-black">Recent activity</h2>
              <p className="mt-2 text-sm text-muted-foreground">Client activity timeline will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
