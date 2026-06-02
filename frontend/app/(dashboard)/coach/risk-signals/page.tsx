'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { riskSignalsV2Api, type RiskScanFullResult } from '@/lib/api/modules/risk-signals-v2';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { trainingApi } from '@/lib/api/modules/training';
import { AlertTriangle, TrendingDown, DollarSign, Clock, ShieldAlert, Loader, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

type RiskFlagItem = {
  id: string;
  clientUserId: string;
  flagType: string;
  severity: string;
  title: string;
  body?: string | null;
  status: string;
  createdAt: string;
};

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-pulse/10 text-pulse',
  HIGH: 'bg-energy/10 text-energy',
  MEDIUM: 'bg-flow/10 text-flow',
  LOW: 'bg-muted text-muted-foreground',
};

export default function CoachRiskSignalsPage() {
  const result = useAsyncData<RiskScanFullResult>(() => riskSignalsV2Api.scanFull(), []);
  const clients = useAsyncData(() => trainingApi.listCoachClients(), []);
  const [scanning, setScanning] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [resolving, setResolving] = useState<Set<string>>(new Set());

  const scan = result.data;
  const clientItems = clients.data?.items ?? [];
  const clientMap = new Map(clientItems.map(c => [c.id, c]));

  const allItems: RiskFlagItem[] = [
    ...(scan?.lowAdherence?.items ?? []),
    ...(scan?.stalledProgress?.items ?? []),
    ...(scan?.paymentRisk?.items ?? []),
  ];
  const totalFlags = (scan?.lowAdherence?.flagsCreated ?? 0) + (scan?.stalledProgress?.flagsCreated ?? 0) + (scan?.paymentRisk?.flagsCreated ?? 0);

  const grouped = SEVERITY_ORDER.reduce((acc, sev) => {
    const items = allItems.filter(f => f.severity === sev);
    if (items.length > 0) acc[sev] = items;
    return acc;
  }, {} as Record<string, RiskFlagItem[]>);

  function getClientName(clientUserId: string) {
    const c = clientMap.get(clientUserId);
    return c ? `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email : clientUserId.slice(0, 8) + '...';
  }

  const handleRescan = useCallback(async () => {
    setScanning(true);
    try {
      await riskSignalsV2Api.scanFull();
      await result.reload();
    } finally {
      setScanning(false);
    }
  }, [result]);

  async function handleResolve(flagId: string) {
    setResolving(prev => new Set(prev).add(flagId));
    try {
      await coachIntelligenceApi.resolveRiskFlag(flagId);
      await result.reload();
    } finally {
      setResolving(prev => { const n = new Set(prev); n.delete(flagId); return n; });
    }
  }

  function toggleCollapse(sev: string) {
    setCollapsed(prev => ({ ...prev, [sev]: !prev[sev] }));
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Risk signals" subtitle="Scan for low adherence, stalled progress, and payment or access risks." />

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{totalFlags} risk flag{totalFlags !== 1 ? 's' : ''} detected</p>
          <Button onClick={handleRescan} disabled={scanning} className="gap-2">
            {scanning ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {scanning ? 'Scanning...' : 'Run scan'}
          </Button>
        </div>

        {result.loading ? (
          <div className="grid gap-4 md:grid-cols-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : result.error ? (
          <ErrorState message={result.error} onRetry={result.reload} />
        ) : (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-pulse" /><p className="text-xs text-muted-foreground">Low adherence</p></div>
                <p className="mt-1 text-2xl font-black">{scan?.lowAdherence?.flagsCreated ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-energy" /><p className="text-xs text-muted-foreground">Stalled progress</p></div>
                <p className="mt-1 text-2xl font-black">{scan?.stalledProgress?.flagsCreated ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-pulse" /><p className="text-xs text-muted-foreground">Payment issues</p></div>
                <p className="mt-1 text-2xl font-black">{scan?.paymentRisk?.flagsCreated ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {allItems.length > 0 && (
          <div className="space-y-4">
            {SEVERITY_ORDER.filter(sev => grouped[sev]).map(sev => (
              <Card key={sev}>
                <CardContent className="p-5">
                  <button onClick={() => toggleCollapse(sev)} className="mb-3 flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${sev === 'CRITICAL' || sev === 'HIGH' ? 'text-pulse' : 'text-energy'}`} />
                      <h2 className="font-black">{sev} severity</h2>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${SEVERITY_COLORS[sev]}`}>{grouped[sev].length}</span>
                    </div>
                    {collapsed[sev] ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  {!collapsed[sev] && (
                    <div className="space-y-2">
                      {grouped[sev].map(flag => (
                        <div key={flag.id} className="flex items-center justify-between rounded-xl border border-border p-3 transition hover:bg-muted/50">
                          <Link href={`/coach/clients/${flag.clientUserId}`} className="flex flex-1 items-center gap-3">
                            <div>
                              <p className="text-sm font-bold">{flag.title}</p>
                              <p className="text-xs font-medium text-foreground">{getClientName(flag.clientUserId)}</p>
                              {flag.body && <p className="text-xs text-muted-foreground">{flag.body}</p>}
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{flag.flagType.replace(/_/g, ' ').toLowerCase()} &middot; {new Date(flag.createdAt).toLocaleDateString()}</p>
                            </div>
                          </Link>
                          <Button
                            variant="ghost"
                            className="shrink-0 text-pulse hover:bg-pulse/10 px-2 py-1 text-xs"
                            onClick={() => handleResolve(flag.id)}
                            disabled={resolving.has(flag.id)}
                          >
                            {resolving.has(flag.id) ? <Loader className="h-3 w-3 animate-spin" /> : 'Resolve'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {allItems.length === 0 && !result.loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-bold text-muted-foreground">No risk flags detected</p>
              <p className="text-sm text-muted-foreground">Click &quot;Run scan&quot; to check your clients for adherence, progress, and payment risks.</p>
            </CardContent>
          </Card>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
