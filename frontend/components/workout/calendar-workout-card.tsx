'use client';

import { Dumbbell } from 'lucide-react';
import type { WorkoutAssignment } from '@/lib/types/domain';

export function CalendarWorkoutCard({ assignment, onClick, title }: { assignment: WorkoutAssignment; onClick?: (a: WorkoutAssignment) => void; title?: string }) {
  return (
    <button
      onClick={() => onClick?.(assignment)}
      className="w-full rounded-lg border border-border bg-card px-2 py-1.5 text-left text-xs transition hover:bg-muted"
    >
      <div className="flex items-center gap-1">
        <Dumbbell className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{title || 'Workout'}</span>
      </div>
    </button>
  );
}
