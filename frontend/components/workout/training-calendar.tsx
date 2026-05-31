'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { trainingApi } from '@/lib/api/modules/training';
import { CalendarWorkoutCard } from '@/components/workout/calendar-workout-card';
import type { WorkoutAssignment } from '@/lib/types/domain';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_OPTIONS = [1, 2, 4] as const;

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface TrainingCalendarProps {
  clientUserId?: string;
  onAssignDate?: (date: string) => void;
  onCardClick?: (assignment: WorkoutAssignment) => void;
  workoutTitles?: Record<string, string>;
}

export function TrainingCalendar({ clientUserId, onAssignDate, onCardClick, workoutTitles }: TrainingCalendarProps) {
  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [weekCount, setWeekCount] = useState<1 | 2 | 4>(1);
  const [assignments, setAssignments] = useState<WorkoutAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = localDateStr(monday);
  const to = localDateStr(addDays(monday, weekCount * 7 - 1));

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await trainingApi.getCalendarAssignments(from, to, clientUserId);
      setAssignments(res.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [from, to, clientUserId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const grouped = useMemo(() => {
    const map: Record<string, WorkoutAssignment[]> = {};
    for (const a of assignments) {
      const key = a.assignedForDate ? localDateStr(new Date(a.assignedForDate)) : '';
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [assignments]);

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let w = 0; w < weekCount; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(monday, w * 7 + d));
      }
      result.push(week);
    }
    return result;
  }, [monday, weekCount]);

  const today = new Date();

  function prev() { setMonday(d => addDays(d, -7)); }
  function next() { setMonday(d => addDays(d, 7)); }

  const rangeLabel = weekCount === 1
    ? `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${addDays(monday, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${addDays(monday, weekCount * 7 - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition"><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-sm font-bold">{rangeLabel}</span>
          <button onClick={next} className="rounded-xl p-2 text-muted-foreground hover:bg-muted transition"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-1">
          {WEEK_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setWeekCount(n)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${weekCount === n ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {n}w
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: weekCount * 7 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-center rounded-xl border border-pulse/30 bg-pulse/5 p-6">
          <p className="text-sm text-pulse">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold uppercase text-muted-foreground">{d}</div>
          ))}
          {weeks.flat().map((day, i) => {
            const dateKey = localDateStr(day);
            const dayAssignments = grouped[dateKey] ?? [];
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`flex flex-col gap-1 rounded-xl border p-2 min-h-[100px] transition ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {day.getDate()}
                  </span>
                  {dayAssignments.length === 0 && onAssignDate && (
                    <button
                      onClick={() => onAssignDate(dateKey)}
                      className="rounded-md p-0.5 text-muted-foreground opacity-0 hover:opacity-100 hover:bg-muted transition"
                      title="Assign workout"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px]">
                  {dayAssignments.map(a => (
                    <CalendarWorkoutCard key={a.id} assignment={a} title={workoutTitles?.[a.workoutId]} onClick={onCardClick as ((a: WorkoutAssignment) => void) | undefined} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
