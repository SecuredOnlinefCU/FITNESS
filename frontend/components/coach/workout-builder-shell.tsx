'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical } from 'lucide-react';

type ExerciseRow = {
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  prescribedSets: number;
  prescribedReps: string;
  prescribedRestSeconds: number;
  tempo: string;
  notes: string;
};

export function WorkoutBuilderShell() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState('');
  const [programs, setPrograms] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseRow[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trainingApi.listExercises().then(r => setExercises(r.items)).catch(() => {});
    trainingApi.listPrograms().then(r => setPrograms(r.items)).catch(() => {});
  }, []);

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
    setStatus('Saving workout...');
    try {
      const workout = await trainingApi.createWorkout({
        title: title.trim(),
        description: description.trim() || undefined,
        programId: programId || undefined,
        exercises: selectedExercises.map(e => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          prescribedSets: e.prescribedSets,
          prescribedReps: e.prescribedReps,
          prescribedRestSeconds: e.prescribedRestSeconds,
          tempo: e.tempo || undefined,
          notes: e.notes || undefined,
        })),
      });
      setStatus(`Workout "${workout.title}" created!`);
      setTimeout(() => router.push('/coach/workouts'), 1500);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-black">Workout details</h2>
            <p className="text-sm text-muted-foreground">Name your workout and add exercises.</p>
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
              onChange={e => setProgramId(e.target.value)}
            >
              <option value="">No program</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
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
                <button
                  key={ex.id}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition"
                  onClick={() => addExercise(ex)}
                  type="button"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  <span>{ex.name}</span>
                </button>
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
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveExercise(i, -1)} disabled={i === 0} className="text-xs text-muted-foreground hover:text-foreground px-1 disabled:opacity-30">&uarr;</button>
                  <button type="button" onClick={() => moveExercise(i, 1)} disabled={i === selectedExercises.length - 1} className="text-xs text-muted-foreground hover:text-foreground px-1 disabled:opacity-30">&darr;</button>
                  <button type="button" onClick={() => removeExercise(i)} className="text-pulse hover:text-destructive px-1"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
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
                  <label className="text-muted-foreground">Tempo</label>
                  <input value={ex.tempo} onChange={e => updateExercise(i, 'tempo', e.target.value)} className="w-full rounded-lg border border-border bg-card p-1.5 text-center" />
                </div>
              </div>
              <input placeholder="Notes (optional)" value={ex.notes} onChange={e => updateExercise(i, 'notes', e.target.value)} className="w-full rounded-lg border border-border bg-card p-1.5 text-xs" />
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
    </div>
  );
}
