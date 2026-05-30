'use client';

import { habitsApi } from '@/lib/api/modules/habits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function HabitLoopCard({ habit, onLogged }: { habit: any; onLogged?: () => void }) {
  async function log() {
    await habitsApi.logHabit(habit.id);
    onLogged?.();
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="font-black">{habit.title}</p>
          <p className="text-sm text-muted-foreground">{habit.description || 'Complete this habit today.'}</p>
        </div>
        <Button onClick={log}>Log</Button>
      </CardContent>
    </Card>
  );
}
