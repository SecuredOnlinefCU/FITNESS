'use client';

import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { trainingApi } from '@/lib/api/modules/training';
import { Brain, AlertTriangle, Activity, ChevronRight } from 'lucide-react';

type AttentionItem = { clientUserId: string; score: number; severity: string; missedCheckins: number; openTasks: number; unreadMessages: number; inactiveDays: number; riskFlagsOpen: number };
type FlagItem = { id: string; clientUserId: string; flagType: string; severity: string; title: string; body?: string; createdAt: string };

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-pulse/10 text-pulse',
  HIGH: 'bg-energy/10 text-energy',
  MEDIUM: 'bg-flow/10 text-flow',
  LOW: 'bg-muted text-muted-foreground',
};

export default function CoachIntelligencePage() {
  const queue = useAsyncData(() => coachIntelligenceApi.attentionQueue(), []);
  const flags = useAsyncData(() => coachIntelligenceApi.riskFlags(), []);
  const clients = useAsyncData(() => trainingApi.listCoachClients(), []);

  const queueItems: AttentionItem[] = queue.data?.items ?? [];
  const flagItems: FlagItem[] = flags.data?.items ?? [];
  const clientItems = clients.data?.items ?? [];
  const clientMap = new Map(clientItems.map(c => [c.id, c]));

  const loading = queue.loading || flags.loading;
  const error = queue.error || flags.error;

  function getClientName(clientUserId: string) {
    const c = clientMap.get(clientUserId);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email : clientUserId.slice(0, 8) + '...';
  }

  const highFlags = flagItems.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length;
  const totalAttention = queueItems.reduce((s, i) => s + i.score, 0);
  const avgScore = queueItems.length > 0 ? Math.round(totalAttention / queueItems.length) : 0;
  const criticalCount = queueItems.filter(i => i.severity === 'CRITICAL').length;

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Coach intelligence" subtitle="AI-powered insights showing which clients need attention and why." />

        {loading ? (
          <div className="space-y-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { queue.reload(); flags.reload(); }} />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Attention queue</p>
                  <p className="mt-1 text-2xl font-black text-primary">{queueItems.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Critical flags</p>
                  <p className="mt-1 text-2xl font-black text-pulse">{highFlags}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Critical severity</p>
                  <p className="mt-1 text-2xl font-black text-energy">{criticalCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Avg attention score</p>
                  <p className="mt-1 text-2xl font-black text-flow">{avgScore}</p>
                </CardContent>
              </Card>
            </div>

            {queueItems.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-black">Attention queue</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{queueItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {queueItems.sort((a, b) => b.score - a.score).slice(0, 10).map(item => (
                      <Link key={item.clientUserId} href={`/coach/clients/${item.clientUserId}`}>
                        <div className="flex items-center justify-between rounded-xl border border-border p-3 transition hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.LOW}`}>{item.severity}</span>
                            <div>
                              <p className="text-sm font-bold">{getClientName(item.clientUserId)}</p>
                              <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                                {item.missedCheckins > 0 && <span>{item.missedCheckins} missed check-ins</span>}
                                {item.openTasks > 0 && <span>{item.openTasks} open tasks</span>}
                                {item.unreadMessages > 0 && <span>{item.unreadMessages} unread msgs</span>}
                                {item.inactiveDays > 0 && <span>{item.inactiveDays}d inactive</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black">{item.score}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {flagItems.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-energy" />
                    <h3 className="font-black">Risk flags</h3>
                    <span className="rounded-full bg-energy/10 px-2 py-0.5 text-xs font-bold text-energy">{flagItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {flagItems.slice(0, 10).map(flag => (
                      <Link key={flag.id} href={`/coach/clients/${flag.clientUserId}`}>
                        <div className="flex items-center justify-between rounded-xl border border-border p-3 transition hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.LOW}`}>{flag.severity}</span>
                            <div>
                              <p className="text-sm font-bold">{flag.title}</p>
                              <p className="text-xs text-muted-foreground">{getClientName(flag.clientUserId)}</p>
                              {flag.body && <p className="text-xs text-muted-foreground">{flag.body}</p>}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {queueItems.length === 0 && flagItems.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-bold text-muted-foreground">All clear</p>
                  <p className="text-sm text-muted-foreground">No clients need immediate attention. Check the health dashboard for detailed scores.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
