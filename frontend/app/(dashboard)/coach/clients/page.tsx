'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { clientHealthApi } from '@/lib/api/modules/client-health';
import { trainingApi } from '@/lib/api/modules/training';
import { clientsApi } from '@/lib/api/modules/clients';
import type { CoachInvite } from '@/lib/api/modules/clients';
import { Search, Filter, ChevronRight, ShieldCheck, AlertTriangle, MessageSquare, TrendingUp, Mail, Check, X, UserPlus } from 'lucide-react';
import { InviteClientDialog } from '@/components/coach/invite-client-dialog';

type ScoreItem = { clientUserId: string; score: number; healthStatus: string; adherenceScore: number; progressScore: number; engagementScore: number; paymentScore: number };
type CoachClient = { id: string; firstName: string; lastName: string; email: string };
type QueueItem = { id?: string; clientUserId: string; score: number; severity: string; missedCheckins: number; openTasks: number; unreadMessages: number; inactiveDays: number; riskFlagsOpen: number };

export default function CoachClientsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const queue = useAsyncData(() => coachIntelligenceApi.attentionQueue(), []);
  const scores = useAsyncData(() => clientHealthApi.scores(), []);
  const clients = useAsyncData(() => trainingApi.listCoachClients(), []);
  const pending = useAsyncData(() => clientsApi.pendingInvites(), []);

  const loading = queue.loading || scores.loading || clients.loading;
  const error = queue.error || scores.error;

  const queueItems: QueueItem[] = queue.data?.items ?? [];
  const scoreItems: ScoreItem[] = scores.data?.items ?? [];
  const clientItems: CoachClient[] = clients.data?.items ?? [];
  const pendingItems: CoachInvite[] = pending.data?.items ?? [];

  const scoreMap = new Map(scoreItems.map(s => [s.clientUserId, s]));
  const clientMap = new Map(clientItems.map(c => [c.id, c]));

  const filtered = queueItems.length > 0
    ? queueItems.filter(item => {
        if (!debouncedSearch.trim()) return true;
        const client = clientMap.get(item.clientUserId);
        const name = client ? `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase() : '';
        const email = client?.email?.toLowerCase() || '';
        return name.includes(debouncedSearch.toLowerCase()) || email.includes(debouncedSearch.toLowerCase());
      })
    : clientItems
        .filter(c => {
          if (!debouncedSearch.trim()) return true;
          const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
          const email = c.email?.toLowerCase() || '';
          return name.includes(debouncedSearch.toLowerCase()) || email.includes(debouncedSearch.toLowerCase());
        })
        .map(c => ({
          id: c.id,
          clientUserId: c.id,
          score: 50,
          missedCheckins: 0,
          inactiveDays: 0,
          riskFlagsOpen: 0,
          severity: 'LOW',
        } as QueueItem));

  async function handleApprove(inviteId: string) {
    await clientsApi.approveInvite(inviteId);
    pending.reload();
    queue.reload();
    scores.reload();
    clients.reload();
  }

  async function handleDecline(inviteId: string) {
    await clientsApi.declineInvite(inviteId);
    pending.reload();
  }

  async function handleCancel(inviteId: string) {
    await clientsApi.cancelInvite(inviteId);
    pending.reload();
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader
          title="Client dossiers"
          subtitle="Health scores, risk context, adherence, and recommended actions."
          actionLabel="Invite client"
          onAction={() => setShowInvite(true)}
        />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-bold text-muted-foreground">
            <Filter className="h-4 w-4" />Filter
          </div>
        </div>

        {pendingItems.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-black text-foreground">Pending requests ({pendingItems.length})</h2>
            <div className="space-y-2">
              {pendingItems.map(invite => (
                <Card key={invite.id} className="border-energy/30 bg-energy/5">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-energy/10">
                        <Mail className="h-5 w-5 text-energy" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{invite.displayName || invite.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Accepted {invite.acceptedAt ? new Date(invite.acceptedAt).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-success hover:bg-success/10"
                        onClick={() => handleApprove(invite.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />Approve
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-pulse hover:bg-pulse/10"
                        onClick={() => handleDecline(invite.id)}
                      >
                        <X className="mr-1 h-4 w-4" />Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => { queue.reload(); scores.reload(); clients.reload(); }} />
        ) : filtered.length === 0 && queueItems.length === 0 && clientItems.length === 0 ? (
          <div className="rounded-2xl bg-muted p-6 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-bold text-muted-foreground">No clients yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Invite clients to start managing their training.</p>
            <Button className="mt-4" onClick={() => setShowInvite(true)}>Invite client</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const client = clientMap.get(item.clientUserId);
              const health = scoreMap.get(item.clientUserId);
              const score = health?.score ?? item.score ?? 50;
              const risk = score >= 85 ? 'High' : score >= 65 ? 'Medium' : 'Low';
              const riskColor = risk === 'Low' ? 'bg-success/10 text-success' : risk === 'Medium' ? 'bg-energy/10 text-energy' : 'bg-pulse/10 text-pulse';
              const name = client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.email : `Client ${i + 1}`;
              const initials = client ? `${(client.firstName || '')[0] || ''}${(client.lastName || '')[0] || ''}`.toUpperCase() : `${i + 1}`;

              return (
                <Link key={item.id || item.clientUserId} href={`/coach/clients/${item.clientUserId}`}>
                  <Card className="cursor-pointer transition hover:border-primary/30">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">
                            {client ? initials : i + 1}
                          </div>
                          <div>
                            <p className="text-lg font-black">{name}</p>
                            {client?.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
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
                </Link>
              );
            })}
          </div>
        )}

        {showInvite && (
          <InviteClientDialog
            onClose={() => setShowInvite(false)}
            onInvited={() => {
              setShowInvite(false);
              pending.reload();
            }}
          />
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
