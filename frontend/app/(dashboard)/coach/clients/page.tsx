'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { clientHealthApi } from '@/lib/api/modules/client-health';
import { Search, Filter, ChevronRight, ShieldCheck, AlertTriangle, MessageSquare, TrendingUp } from 'lucide-react';

export default function CoachClientsPage() {
  const queue = useAsyncData(() => coachIntelligenceApi.attentionQueue(), []);
  const scores = useAsyncData(() => clientHealthApi.scores(), []);

  const loading = queue.loading || scores.loading;
  const error = queue.error || scores.error;
  const queueItems = queue.data?.items ?? [];
  const scoreItems = scores.data?.items ?? [];
  const scoreMap = new Map(scoreItems.map((s: any) => [s.clientUserId, s]));

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Client dossiers" subtitle="Health scores, risk context, adherence, and recommended actions." />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Search clients..." />
          </div>
          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-bold text-muted-foreground"><Filter className="h-4 w-4" />Filter</div>
        </div>

        {loading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { queue.reload(); scores.reload(); }} />
        ) : queueItems.length === 0 ? (
          <div className="rounded-2xl bg-muted p-6 text-center">
            <p className="font-bold text-muted-foreground">No clients yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Client profiles will appear here once clients are assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.map((item: any, i: number) => {
              const health = scoreMap.get(item.clientUserId);
              const score = health?.score ?? item.score ?? 50;
              const risk = score >= 85 ? 'High' : score >= 65 ? 'Medium' : 'Low';
              const riskColor = risk === 'Low' ? 'bg-success/10 text-success' : risk === 'Medium' ? 'bg-energy/10 text-energy' : 'bg-pulse/10 text-pulse';
              return (
                <Card key={item.id} className="transition hover:border-primary/30">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-black text-foreground">{i + 1}</div>
                        <div>
                          <p className="text-lg font-black">Client {i + 1}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">Score {score}</span>
                            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${riskColor}`}>{risk} risk</span>
                            <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-bold text-muted-foreground">
                              {item.missedCheckins > 0 ? `${item.missedCheckins} missed check-ins` : 'up to date'}
                            </span>
                            {item.inactiveDays > 0 && (
                              <span className="rounded-full bg-muted px-3 py-0.5 text-xs text-muted-foreground">
                                {item.inactiveDays}d inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-4">
                      <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" />Health: {health?.score ?? '--'}</div>
                      <div className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-energy" />Flags: {item.riskFlagsOpen}</div>
                      <div className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-flow" />Missed: {item.missedCheckins}</div>
                      <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-success" />Inactive: {item.inactiveDays}d</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
