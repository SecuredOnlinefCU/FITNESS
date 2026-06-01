'use client';

import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { workoutWarningsApi } from '@/lib/api/modules/workout-warnings';
import { messagingApi } from '@/lib/api/modules/messaging';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import type { Thread } from '@/lib/types/domain';
import { MessageSquare, AlertTriangle, Bell, Activity, Eye, Clock } from 'lucide-react';

type QueueItem = {
  id: string;
  clientUserId: string;
  score: number;
  severity: string;
  missedCheckins: number;
  openTasks: number;
  unreadMessages: number;
  inactiveDays: number;
  riskFlagsOpen: number;
  snapshotDate: string;
};

async function loadCoachHome() {
  type Q = { items: QueueItem[] };
  const [queue, riskFlagsResult, warnings, threads] = await Promise.allSettled([
    coachIntelligenceApi.attentionQueue() as Promise<Q>,
    coachIntelligenceApi.riskFlags() as Promise<{ items: unknown[] }>,
    workoutWarningsApi.list() as Promise<{ items: unknown[] }>,
    messagingApi.listThreads() as Promise<{ items: Thread[] }>,
  ]);

  const queueItems: QueueItem[] = queue.status === 'fulfilled' ? queue.value.items : [];
  const riskFlagItems = riskFlagsResult.status === 'fulfilled' ? riskFlagsResult.value.items : [];
  const warningItems = warnings.status === 'fulfilled' ? warnings.value.items : [];
  const threadItems: Thread[] = threads.status === 'fulfilled' ? threads.value.items : [];

  const activeClients = new Set(threadItems.map((t) => t.clientUserId)).size;
  const unreadCount = threadItems.filter((t) => {
    const msgs = t.messages || [];
    return msgs.length > 0 && msgs[msgs.length - 1]?.senderUserId !== 'coach';
  }).length;

  const recent = [...queueItems]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    activeClients,
    dueCheckins: queueItems.filter((i) => i.missedCheckins > 0).length,
    unread: unreadCount,
    riskFlags: riskFlagItems.length,
    recoveryWarnings: warningItems.length,
    queueItems,
    riskFlagItems,
    warningItems,
    recent,
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

  const severityColor = (s: string) => {
    switch (s) {
      case 'CRITICAL': return 'text-pulse';
      case 'HIGH': return 'text-energy';
      case 'MEDIUM': return 'text-flow';
      default: return 'text-muted-foreground';
    }
  };

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
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black">
                <Clock className="h-5 w-5 text-primary" />
                Recent activity
              </h2>
              {data.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity to review.</p>
              ) : (
                <div className="space-y-3">
                  {data.recent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">Client {item.clientUserId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.missedCheckins > 0 && `${item.missedCheckins} missed check-ins`}
                          {item.openTasks > 0 && (item.missedCheckins > 0 ? ' · ' : '') + `${item.openTasks} open tasks`}
                          {!item.missedCheckins && !item.openTasks && `Score ${item.score}`}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-bold ${severityColor(item.severity)}`}>{item.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
