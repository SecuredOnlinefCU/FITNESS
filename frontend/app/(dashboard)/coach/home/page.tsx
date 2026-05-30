import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { LiveCoachHome } from '@/components/coach/live/live-coach-home';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShieldCheck } from 'lucide-react';
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

          <LiveCoachHome />

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
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
            </div>
          </div>
        </DashboardShell>
      </div>
    </ProtectedRoute>
  );
}
