import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ClientPageHeader } from '@/components/levelfitness/client-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Timer, Trophy, ChevronRight, AlertTriangle } from 'lucide-react';

export default function ClientWorkoutsPage() {
  return (
    <ProtectedRoute roles={['client', 'super_admin']}>
      <DashboardShell>
        <ClientPageHeader title="Train" subtitle="Your assigned training, workout history, and performance progression." />

        <div className="rounded-2xl border border-primary/20 bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Today&apos;s workout</p>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">Upper body focus</h2>
              <div className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Timer className="h-4 w-4" />45 min</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Dumbbell className="h-4 w-4" />6 exercises</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Trophy className="h-4 w-4" />Week 3 of 12</div>
              </div>
            </div>
            <div className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">Start</div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-energy/20 bg-energy/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-energy" />
          <div>
            <p className="font-bold text-energy">Recovery notice</p>
            <p className="text-sm text-muted-foreground">Your readiness score is lower than usual. Consider reducing intensity by 10-15% today.</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="text-lg font-black">Exercises</h3>
          {['Bench press', 'Dumbbell row', 'Overhead press', 'Pull-ups', 'Lateral raises', 'Face pulls'].map((exercise, i) => (
            <Card key={exercise}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-sm font-bold text-muted-foreground">{i + 1}</div>
                  <div>
                    <p className="font-bold">{exercise}</p>
                    <p className="text-sm text-muted-foreground">4 x 8-10 reps</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold">Coach cues</h3>
              <p className="mt-2 text-sm text-muted-foreground">Coach notes and technique cues will appear during your workout.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold">Previous best</h3>
              <p className="mt-2 text-sm text-muted-foreground">Compare your performance against last session&apos;s logged weights and reps.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Workout history</h2>
              <p className="mt-2 text-sm text-muted-foreground">Completed sessions and performance trends will appear here.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h2 className="font-bold">Exercise library</h2>
              <p className="mt-2 text-sm text-muted-foreground">Video demos and technique guides for every exercise in your program.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
