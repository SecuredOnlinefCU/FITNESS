import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Utensils, TrendingUp, MessageSquare, Flame, Trophy } from 'lucide-react';

const stats = [
  { icon: Flame, label: 'Current streak', value: '0 days' },
  { icon: Trophy, label: 'Workouts completed', value: '0' },
  { icon: TrendingUp, label: 'Consistency', value: '--' },
];

const actions = [
  { icon: Dumbbell, title: 'Training', description: 'Open assigned workouts and log your sets.', href: '/client/workouts' },
  { icon: Utensils, title: 'Nutrition', description: 'Log meals and track macro targets.', href: '/client/nutrition' },
  { icon: TrendingUp, title: 'Progress', description: 'Add metrics and progress photos.', href: '/client/progress' },
  { icon: MessageSquare, title: 'Messages', description: 'Chat with your coach.', href: '/client/messages' },
];

export default function ClientHomePage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Your dashboard" subtitle="Your training, nutrition, progress, and coach communication in one place." />

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <a key={action.title} href={action.href}>
                <Card className="transition hover:border-primary/30">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="rounded-2xl bg-muted p-4 text-primary"><Icon className="h-6 w-6" /></div>
                    <div>
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
