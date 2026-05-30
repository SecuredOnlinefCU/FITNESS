import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { LiveClientToday } from '@/components/client/live/live-client-today';

export default function ClientTodayPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <div className="relative">
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] opacity-[0.07]">
            <img src="/images/dashboard-decor.png" alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        <DashboardShell>
          <ClientPageHeader title="Today" subtitle="Your adaptive LevelFITness plan for the next best action." />
          <LiveClientToday />
        </DashboardShell>
      </div>
    </ProtectedRoute>
  );
}
