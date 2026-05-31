'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical, Play } from 'lucide-react';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';

type ExerciseRow = {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  prescribedSets: number;
  prescribedReps: string;
  prescribedRestSeconds: number;
  prescribedRpe: number;
  supersetGroupId: string;
  tempo: string;
  notes: string;
};

export function WorkoutBuilderShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState('');
  const [weekId, setWeekId] = useState('');
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseRow[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  useEffect(() => {
    trainingApi.listExercises().then(r => setExercises(r.items)).catch(() => {});
    trainingApi.listPrograms().then(r => setPrograms(r.items)).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      trainingApi.getWorkout(editId).then(w => {
        if (!w) return;
        setTitle(w.title);
        setDescription(w.description ?? '');
        setProgramId(w.programId ?? '');
        setWeekId(w.weekId ?? '');
        setDayIndex(w.dayIndex ?? 1);
        if (w.exercises) {
          setSelectedExercises(w.exercises.map((e: any, i: number) => ({
            id: e.id,
            exerciseId: e.exerciseId,
            exerciseName: e.exercise?.name ?? 'Unknown',
            orderIndex: i,
            prescribedSets: e.prescribedSets ?? 3,
            prescribedReps: String(e.prescribedReps ?? '10'),
            prescribedRestSeconds: e.prescribedRestSeconds ?? 60,
            prescribedRpe: e.prescribedRpe ?? 7,
            supersetGroupId: e.supersetGroupId ?? '',
            tempo: e.tempo ?? '2-0-1-0',
            notes: e.notes ?? '',
          })));
        }
        setLoadingEdit(false);
      }).catch(() => setLoadingEdit(false));
    }
  }, [editId]);

  useEffect(() => {
    if (programId) {
      trainingApi.listPrograms().then((progs: any) => {
        const prog = (progs.items ?? []).find((p: any) => p.id === programId);
        if (prog?.weeks) setWeeks(prog.weeks);
      }).catch(() => {});
    } else {
      setWeeks([]);
      setWeekId('');
    }
  }, [programId]);

  const filteredExercises = exercises.filter(e =>
    e.name?.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  function addExercise(exercise: any) {
    setSelectedExercises(prev => [...prev, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex: prev.length,
      prescribedSets: 3,
      prescribedReps: '10',
      prescribedRestSeconds: 60,
      prescribedRpe: 7,
      supersetGroupId: '',
      tempo: '2-0-1-0',
      notes: '',
    }]);
    setExerciseSearch('');
  }

  function removeExercise(index: number) {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, orderIndex: i })));
  }

  function updateExercise(index: number, field: keyof ExerciseRow, value: any) {
    setSelectedExercises(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }

  function moveExercise(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= selectedExercises.length) return;
    setSelectedExercises(prev => {
      const next = [...prev];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next.map((e, i) => ({ ...e, orderIndex: i }));
    });
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setStatus(editId ? 'Updating workout...' : 'Saving workout...');
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        programId: programId || undefined,
        weekId: weekId || undefined,
        dayIndex: dayIndex || undefined,
        exercises: selectedExercises.map(e => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          prescribedSets: e.prescribedSets,
          prescribedReps: e.prescribedReps,
          prescribedRestSeconds: e.prescribedRestSeconds,
          prescribedRpe: e.prescribedRpe,
          supersetGroupId: e.supersetGroupId || undefined,
          tempo: e.tempo || undefined,
          notes: e.notes || undefined,
        })),
      };
      if (editId) {
        await trainingApi.updateWorkout(editId, body);
        setStatus('Workout updated!');
      } else {
        const workout = await trainingApi.createWorkout(body);
        setStatus(`Workout "${workout.title}" created!`);
      }
      setTimeout(() => router.push('/coach/workouts'), 1500);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  }

  function nextSupersetGroup() {
    const groups = selectedExercises.map(e => e.supersetGroupId).filter(Boolean);
    return groups.length === 0 ? 'A' : String.fromCharCode(64 + groups.length + 1);
  }

  if (loadingEdit) {
    return <div className="p-5 text-sm text-muted-foreground">Loading workout...</div>;
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-black">{editId ? 'Edit workout' : 'New workout'}</h2>
            <p className="text-sm text-muted-foreground">{editId ? 'Update your workout details.' : 'Name your workout and add exercises.'}</p>
          </div>

          <Input placeholder="Workout title" value={title} onChange={e => setTitle(e.target.value)} />

          <textarea
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Description (optional)"
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          {programs.length > 0 && (
            <select
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={programId}
              onChange={e => { setProgramId(e.target.value); setWeekId(''); }}
            >
              <option value="">No program</option>
              {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

            {programId && weeks.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <select
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                value={weekId}
                onChange={e => { setWeekId(e.target.value); if (!title && dayIndex) setTitle(`Week ${(weeks.find((w: any) => w.id === e.target.value)?.weekIndex ?? '?')} Day ${dayIndex}`); }}
              >
                <option value="">No week</option>
                {weeks.map((w: any) => <option key={w.id} value={w.id}>Week {w.weekIndex}{w.phaseLabel ? ` — ${w.phaseLabel}` : ''}</option>)}
              </select>
              <div>
                <label className="text-xs text-muted-foreground">Day #</label>
                <input type="number" min={1} max={7} value={dayIndex ?? ''} onChange={e => { const d = Number(e.target.value); setDayIndex(d); if (!title && weekId) setTitle(`Week ${(weeks.find((w: any) => w.id === weekId)?.weekIndex ?? '?')} Day ${d}`); }} className="w-full rounded-xl border border-border bg-card p-3 text-sm" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="font-black">Exercises</h3>

          <Input placeholder="Search exercises..." value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} />

          {exerciseSearch && filteredExercises.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-border">
              {filteredExercises.slice(0, 8).map(ex => (
                <div key={ex.id} className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-muted transition group">
                  <button
                    className="flex flex-1 items-center gap-3 text-left"
                    onClick={() => addExercise(ex)}
                    type="button"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span>{ex.name}</span>
                  </button>
                  {ex.demoVideoUrl && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setVideoUrl(ex.demoVideoUrl); }}
                      className="rounded-full p-1.5 text-flow/60 hover:text-flow hover:bg-flow/10 transition"
                      aria-label={`Watch ${ex.name} demo`}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedExercises.length === 0 && (
            <p className="text-sm text-muted-foreground">Search and add exercises above.</p>
          )}

          {selectedExercises.map((ex, i) => (
            <div key={i} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-sm">{i + 1}. {ex.exerciseName}</span>
                  {ex.supersetGroupId && <span className="rounded bg-flow/10 px-1.5 py-0.5 text-[10px] font-bold text-flow">Superset {ex.supersetGroupId}</span>}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveExercise(i, -1)} disabled={i === 0} className="text-xs text-muted-foreground hover:text-foreground px-1 disabled:opacity-30">&uarr;</button>
                  <button type="button" onClick={() => moveExercise(i, 1)} disabled={i === selectedExercises.length - 1} className="text-xs text-muted-foreground hover:text-foreground px-1 disabled:opacity-30">&darr;</button>
                  <button type="button" onClick={() => removeExercise(i)} className="text-pulse hover:text-destructive px-1"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="text-muted-foreground">Sets</label>
                  <input type="number" min={1} max={20} value={ex.prescribedSets} onChange={e => updateExercise(i, 'prescribedSets', Number(e.target.value))} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
                <div>
                  <label className="text-muted-foreground">Reps</label>
                  <input value={ex.prescribedReps} onChange={e => updateExercise(i, 'prescribedReps', e.target.value)} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
                <div>
                  <label className="text-muted-foreground">Rest (s)</label>
                  <input type="number" min={0} step={15} value={ex.prescribedRestSeconds} onChange={e => updateExercise(i, 'prescribedRestSeconds', Number(e.target.value))} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
                <div>
                  <label className="text-muted-foreground">RPE</label>
                  <input type="number" min={1} max={10} value={ex.prescribedRpe} onChange={e => updateExercise(i, 'prescribedRpe', Number(e.target.value))} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
                <div>
                  <label className="text-muted-foreground">Tempo</label>
                  <input value={ex.tempo} onChange={e => updateExercise(i, 'tempo', e.target.value)} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input placeholder="Notes (optional)" value={ex.notes} onChange={e => updateExercise(i, 'notes', e.target.value)} className="flex-1 rounded-lg border border-border bg-card p-1.5 text-xs" />
                <button
                  type="button"
                  onClick={() => updateExercise(i, 'supersetGroupId', ex.supersetGroupId ? '' : nextSupersetGroup())}
                  className={`rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${ex.supersetGroupId ? 'bg-flow/10 text-flow' : 'bg-muted text-muted-foreground hover:text-flow'}`}
                >
                  {ex.supersetGroupId ? `Superset ${ex.supersetGroupId}` : 'Superset +'}
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : <div />}
        <Button onClick={handleSave} disabled={!title.trim() || saving}>
          {saving ? 'Saving...' : 'Save workout'}
        </Button>
      </div>

      {videoUrl && <VideoPlayerModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
