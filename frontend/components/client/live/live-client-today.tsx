'use client';

import { Sparkles, Dumbbell, MessageSquare, Moon, Footprints, Heart, Calendar, ChevronRight, Flame } from 'lucide-react';
import { useClientToday } from '@/hooks/intelligence/use-client-today';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';

const quickActions = [
  { icon: Dumbbell, label: 'Workout', href: '/client/workouts' },
  { icon: MessageSquare, label: 'Messages', href: '/client/messages' },
  { icon: Heart, label: 'Progress', href: '/client/progress' },
  { icon: Calendar, label: 'Schedule', href: '/client/workouts' },
];

export function LiveClientToday() {
  const today = useClientToday();

  if (today.loading) {
    return <div className="grid gap-4"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>;
  }

  if (today.error) return <ErrorState message={today.error} onRetry={today.reload} />;

  const d = new Date();
  const hour = d.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const score = today.data?.completionScore ?? 0;
  const recommendations = today.data?.recommendations || [];
  const snapshot = today.data?.snapshot;
  const streak = today.data?.streak ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">{greeting}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-energy" />
          <span className="text-sm font-bold text-energy">{streak} day streak</span>
        </div>
      )}

      <Card className="relative overflow-hidden border-primary/20">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        <CardContent className="p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Today score</p>
          <p className="mt-2 text-6xl font-black tracking-tight md:text-7xl">{score}<span className="text-3xl text-muted-foreground">%</span></p>
          <p className="mt-2 max-w-lg text-muted-foreground">Your consistency score based on today&apos;s habits, workouts, and actions. Keep the streak alive.</p>
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${score}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <a key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary/30 hover:bg-muted">
              <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
              <p className="text-xs font-bold">{action.label}</p>
            </a>
          );
        })}
      </div>

      {recommendations.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Next best action</h2>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((item, i) => (
                <div key={item.id} className={`rounded-2xl border p-4 ${i === 0 ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.body}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-black">Today&apos;s workout</h2>
                <p className="text-sm text-muted-foreground">Preview your assigned training</p>
              </div>
            </div>
            {today.data?.todayWorkout ? (
              <div className="rounded-2xl bg-muted p-4">
                <p className="font-bold">{today.data.todayWorkout.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {today.data.todayWorkout.exerciseCount} exercises &bull; {today.data.todayWorkout.estimatedDuration} min
                </p>
                <a href="/client/workouts" className="mt-3 inline-block text-xs font-bold text-primary hover:underline">
                  Start workout &rarr;
                </a>
              </div>
            ) : (
              <div className="rounded-2xl bg-muted p-4 text-center">
                <p className="font-bold">No workout scheduled</p>
                <p className="text-sm text-muted-foreground">Rest day or check your program</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-black">Coach</h2>
                <p className="text-sm text-muted-foreground">Latest from your coach</p>
              </div>
            </div>
            <div className="rounded-2xl bg-muted p-4 text-center">
              <p className="font-bold">No new messages</p>
              <p className="text-sm text-muted-foreground">Coach updates appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black">Recovery summary</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Sleep</p>
              <p className="mt-1 text-2xl font-black">{snapshot?.sleepMinutes ? `${Math.round(snapshot.sleepMinutes / 60)}h` : '--'}</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Readiness</p>
              <p className="mt-1 text-2xl font-black">{snapshot?.readinessScore ?? '--'}</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Steps</p>
              <p className="mt-1 text-2xl font-black">{snapshot?.steps ?? '--'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Footprints className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-black">Weekly consistency</h2>
          </div>
          <div className="flex gap-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
              const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <p className="text-xs text-muted-foreground">{day}</p>
                  <div className={`h-12 w-full rounded-lg ${i < dayIndex ? 'bg-primary/30' : 'bg-muted'}`} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
