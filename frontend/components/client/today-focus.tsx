import { CheckCircle2, Flame, Utensils, Dumbbell, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

type FocusItem = {
  icon: LucideIcon;
  title: string;
  detail: string;
  href?: string;
};

const defaultItems: FocusItem[] = [
  { icon: CheckCircle2, title: 'Complete today\'s task', detail: 'No task due yet' },
  { icon: Flame, title: 'Workout', detail: 'Check your assigned training', href: '/client/workouts' },
  { icon: Utensils, title: 'Nutrition', detail: 'Log your next meal', href: '/client/nutrition' },
];

export function TodayFocus({ items, streak }: { items?: FocusItem[]; streak?: number }) {
  const focusItems = items ?? defaultItems;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Today&apos;s focus</h2>
            <p className="text-sm text-muted-foreground">The next best actions for your plan.</p>
          </div>
          {streak && streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-energy/10 px-3 py-1">
              <Flame className="h-4 w-4 text-energy" />
              <span className="text-sm font-bold text-energy">{streak} day streak</span>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {focusItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4 hover:border-primary/30 transition">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            );
            return item.href ? (
              <a key={item.title} href={item.href} className="block">
                {content}
              </a>
            ) : (
              <div key={item.title}>{content}</div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
