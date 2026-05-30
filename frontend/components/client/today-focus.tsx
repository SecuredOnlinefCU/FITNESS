import { CheckCircle2, Flame, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const items = [
  { icon: CheckCircle2, title: 'Complete today’s task', detail: 'No task due yet' },
  { icon: Flame, title: 'Workout', detail: 'Check your assigned training' },
  { icon: Utensils, title: 'Nutrition', detail: 'Log your next meal' },
];

export function TodayFocus() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Today’s focus</h2>
            <p className="text-sm text-muted-foreground">The next best actions for your plan.</p>
          </div>
        </div>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
