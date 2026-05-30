import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, Filter, ChevronRight, ShieldCheck, Activity, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

const clients = [
  { name: 'Alex Chen', status: 'Active', score: 92, risk: 'Low', adherence: '85%', lastCheckIn: '2h ago' },
  { name: 'Sarah Miller', status: 'Active', score: 78, risk: 'Medium', adherence: '72%', lastCheckIn: '1d ago' },
  { name: 'James Wilson', status: 'At risk', score: 45, risk: 'High', adherence: '34%', lastCheckIn: '5d ago' },
];

export default function CoachClientsPage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <CoachPageHeader title="Client dossiers" subtitle="Health scores, risk context, adherence, and recommended actions — one connected intelligence file per client." />

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground" placeholder="Search clients..." />
          </div>
          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-4 text-sm font-bold text-muted-foreground"><Filter className="h-4 w-4" />Filter</div>
        </div>

        <div className="space-y-3">
          {clients.map((client) => (
            <Card key={client.name} className="transition hover:border-primary/30">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-black text-foreground">{client.name.charAt(0)}</div>
                    <div>
                      <p className="text-lg font-black">{client.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">Score {client.score}</span>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                          client.risk === 'Low' ? 'bg-success/10 text-success' :
                          client.risk === 'Medium' ? 'bg-energy/10 text-energy' :
                          'bg-pulse/10 text-pulse'
                        }`}>{client.risk} risk</span>
                        <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-bold text-muted-foreground">{client.adherence} adherence</span>
                        <span className="text-xs text-muted-foreground">Last check-in {client.lastCheckIn}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" />Today context</div>
                  <div className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-energy" />Risk timeline</div>
                  <div className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-flow" />Messaging</div>
                  <div className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-success" />Progress</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
