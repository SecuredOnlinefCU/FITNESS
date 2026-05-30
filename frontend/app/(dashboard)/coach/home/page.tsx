import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, AlertTriangle, Activity, Bell, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function CoachHomePage() {
  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <div className="relative">
        <div className="pointer-events-none fixed right-0 top-0 -z-10 h-[600px] w-[500px]" aria-hidden="true">
          <Image src="/images/coach-hero.png" alt="" fill className="object-cover opacity-[0.06]" sizes="500px" />
        </div>
        <DashboardShell>
          <CoachPageHeader title="Command center" subtitle="Executive overview of your coaching business — clients, risks, messages, and actions." />

        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Active clients</p>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Due check-ins</p>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Unread</p>
              <p className="mt-1 text-2xl font-black">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Risk flags</p>
              <p className="mt-1 text-2xl font-black text-energy">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Recovery warnings</p>
              <p className="mt-1 text-2xl font-black text-flow">0</p>
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
                  { icon: MessageSquare, title: 'Unread client messages', count: '0' },
                  { icon: AlertTriangle, title: 'Risk flags requiring review', count: '0' },
                  { icon: Bell, title: 'Overdue check-ins', count: '0' },
                  { icon: Activity, title: 'Recovery warnings', count: '0' },
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
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-black">Quick actions</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Create a program', href: '/coach/programs/new' },
                    { label: 'Build a workout', href: '/coach/workouts/builder' },
                    { label: 'Create a package', href: '/coach/packages' },
                  ].map((action) => (
                    <a key={action.label} href={action.href} className="flex items-center justify-between rounded-2xl border border-border p-3 transition hover:bg-muted">
                      <span className="font-bold">{action.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-black">Recent activity</h2>
                <p className="mt-2 text-sm text-muted-foreground">Client activity timeline will appear here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
      </div>
    </ProtectedRoute>
  );
}
