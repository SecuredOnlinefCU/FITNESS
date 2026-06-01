'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, GripVertical, Play, ChevronDown, ChevronRight, Video, Search, Dumbbell } from 'lucide-react';
import { VideoPlayerModal } from '@/components/exercise/video-player-modal';

type ExerciseRow = {
  id: string;
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
  demoVideoUrl?: string;
};

function SortableCard({
  exercise,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onPlayVideo,
  onToggleSuperset,
  nextSupersetGroup,
}: {
  exercise: ExerciseRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onUpdate: (index: number, field: keyof ExerciseRow, value: unknown) => void;
  onRemove: (index: number) => void;
  onPlayVideo: (url: string) => void;
  onToggleSuperset: (index: number) => void;
  nextSupersetGroup: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button className="flex min-h-[44px] min-w-[44px] cursor-grab touch-none items-center justify-center text-muted-foreground hover:text-foreground transition" {...attributes} {...listeners} type="button" aria-label="Drag to reorder">
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-bold text-sm min-w-[1.5rem] text-muted-foreground">{index + 1}.</span>
        <span className="font-bold text-sm truncate flex-1">{exercise.exerciseName}</span>
        {exercise.supersetGroupId && (
          <span className="rounded bg-flow/10 px-1.5 py-0.5 text-[10px] font-bold text-flow shrink-0">SS {exercise.supersetGroupId}</span>
        )}
        <span className="text-xs text-muted-foreground shrink-0">
          {exercise.prescribedSets}×{exercise.prescribedReps} · RPE {exercise.prescribedRpe}
        </span>
        {exercise.demoVideoUrl && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlayVideo(exercise.demoVideoUrl!); }}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-flow/60 hover:text-flow hover:bg-flow/10 transition shrink-0"
            aria-label={`Watch ${exercise.exerciseName} demo`}
          >
            <Play className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleExpand(exercise.id)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition shrink-0"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-pulse/60 hover:text-pulse hover:bg-pulse/10 transition shrink-0"
          aria-label="Remove exercise"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {isExpanded && (
        <div className="border-t border-border px-3 py-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
            <div>
              <label className="text-muted-foreground font-medium">Sets</label>
              <input type="number" min={1} max={20} value={exercise.prescribedSets}
                onChange={e => onUpdate(index, 'prescribedSets', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card p-1.5 text-center text-base mt-1 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Sets" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium">Reps</label>
              <input value={exercise.prescribedReps}
                onChange={e => onUpdate(index, 'prescribedReps', e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-1.5 text-center text-base mt-1 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Reps" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium">Rest (s)</label>
              <input type="number" min={0} step={15} value={exercise.prescribedRestSeconds}
                onChange={e => onUpdate(index, 'prescribedRestSeconds', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card p-1.5 text-center text-base mt-1 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Rest seconds" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium">RPE</label>
              <input type="number" min={1} max={10} value={exercise.prescribedRpe}
                onChange={e => onUpdate(index, 'prescribedRpe', Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-card p-1.5 text-center text-base mt-1 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="RPE" />
            </div>
            <div>
              <label className="text-muted-foreground font-medium">Tempo</label>
              <input value={exercise.tempo}
                onChange={e => onUpdate(index, 'tempo', e.target.value)}
                className="w-full rounded-lg border border-border bg-card p-1.5 text-center text-base mt-1 focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Tempo" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input placeholder="Notes (optional)" value={exercise.notes}
              onChange={e => onUpdate(index, 'notes', e.target.value)}
              className="flex-1 rounded-lg border border-border bg-card p-1.5 text-base focus:outline-none focus:ring-1 focus:ring-primary" aria-label="Notes" />
            <button
              type="button"
              onClick={() => onToggleSuperset(index)}
              className={`min-h-[44px] shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${exercise.supersetGroupId ? 'bg-flow/10 text-flow' : 'bg-muted text-muted-foreground hover:text-flow'}`}
            >
              {exercise.supersetGroupId ? `Superset ${exercise.supersetGroupId}` : 'Superset +'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    trainingApi.listExercises().then(r => setExercises(r.items)).catch(() => toast.error('Failed to load exercises'));
    trainingApi.listPrograms().then(r => setPrograms(r.items)).catch(() => toast.error('Failed to load programs'));
  }, []);

  useEffect(() => {
    if (programId) {
      trainingApi.listPrograms().then((progs: any) => {
        const prog = (progs.items ?? []).find((p: any) => p.id === programId);
        if (prog?.weeks) setWeeks(prog.weeks);
      }).catch(() => toast.error('Failed to load program weeks'));
    } else {
      setWeeks([]);
      setWeekId('');
    }
  }, [programId]);

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
          const rows = w.exercises.map((e: any, i: number) => ({
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
            demoVideoUrl: e.exercise?.demoVideoUrl ?? undefined,
          }));
          setSelectedExercises(rows);
        }
        setLoadingEdit(false);
      }).catch(() => setLoadingEdit(false));
    }
  }, [editId]);

  const filteredExercises = useMemo(() =>
    exercises.filter((e: any) =>
      e.name?.toLowerCase().includes(exerciseSearch.toLowerCase())
    ).slice(0, 30),
    [exercises, exerciseSearch]
  );

  function addExercise(ex: any) {
    setSelectedExercises(prev => [...prev, {
      id: crypto.randomUUID(),
      exerciseId: ex.id,
      exerciseName: ex.name,
      orderIndex: prev.length,
      prescribedSets: 3,
      prescribedReps: '10',
      prescribedRestSeconds: 60,
      prescribedRpe: 7,
      supersetGroupId: '',
      tempo: '2-0-1-0',
      notes: '',
      demoVideoUrl: ex.demoVideoUrl ?? undefined,
    }]);
  }

  function removeExercise(index: number) {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  }

  function updateExercise(index: number, field: keyof ExerciseRow, value: unknown) {
    setSelectedExercises(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  }

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSuperset(index: number) {
    setSelectedExercises(prev => prev.map((e, i) => {
      if (i !== index) return e;
      return { ...e, supersetGroupId: e.supersetGroupId ? '' : nextSupersetGroup(prev) };
    }));
  }

  function nextSupersetGroup(items: ExerciseRow[]) {
    const groups = items.map(e => e.supersetGroupId).filter(Boolean);
    return groups.length === 0 ? 'A' : String.fromCharCode(64 + groups.length + 1);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSelectedExercises(prev => {
      const oldIndex = prev.findIndex(e => e.id === active.id);
      const newIndex = prev.findIndex(e => e.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const totalSets = useMemo(() =>
    selectedExercises.reduce((sum, e) => sum + e.prescribedSets, 0),
    [selectedExercises]
  );

  const estimatedMinutes = useMemo(() =>
    Math.round(selectedExercises.reduce((sum, e) => sum + e.prescribedSets * 2, 0) + selectedExercises.length * 2),
    [selectedExercises]
  );

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
        exercises: selectedExercises.map((e, i) => ({
          exerciseId: e.exerciseId,
          orderIndex: i,
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
        setTimeout(() => router.push('/coach/workouts'), 1200);
      } else {
        const workout = await trainingApi.createWorkout(body);
        setTimeout(() => router.push(`/coach/workouts?assign=${workout.id}`), 800);
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save workout.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-muted-foreground animate-pulse">Loading workout...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">{editId ? 'Edit workout' : 'New workout'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{editId ? 'Update your workout details.' : 'Build a workout by adding exercises from your library.'}</p>
        </div>
        <Button onClick={() => router.push('/coach/workouts')} variant="ghost">Back to workouts</Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-80 shrink-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-black text-sm text-muted-foreground tracking-widest uppercase flex items-center gap-2">
                <Search className="h-3.5 w-3.5" /> Exercise library
              </h2>
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={e => setExerciseSearch(e.target.value)}
              />
              <div className="max-h-[60vh] overflow-y-auto space-y-0.5 -mx-1">
                {exerciseSearch && filteredExercises.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3 text-center">No exercises match your search.</p>
                )}
                {filteredExercises.map((ex: any) => (
                  <div key={ex.id} className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm hover:bg-muted transition group">
                    <button
                      className="flex flex-1 items-center gap-2.5 text-left min-w-0"
                      onClick={() => addExercise(ex)}
                      type="button"
                    >
                      <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate font-medium">{ex.name}</span>
                    </button>
                    {ex.demoVideoUrl && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setVideoUrl(ex.demoVideoUrl); }}
                        className="rounded-full p-1.5 text-flow/60 hover:text-flow hover:bg-flow/10 transition shrink-0 opacity-0 group-hover:opacity-100"
                        aria-label={`Watch ${ex.name} demo`}
                      >
                        <Play className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {!exerciseSearch && filteredExercises.length === 0 && (
                  <p className="text-xs text-muted-foreground px-2 py-3 text-center">No exercises available. Create one first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0 space-y-5">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-black text-sm text-muted-foreground tracking-widest uppercase">Workout details</h2>
              <Input placeholder="Workout title" value={title} onChange={e => setTitle(e.target.value)} />
              <textarea
                className="w-full rounded-xl border border-border bg-card p-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Description (optional)"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                aria-label="Description"
              />
              {programs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    className="rounded-xl border border-border bg-card p-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={programId}
                    onChange={e => { setProgramId(e.target.value); setWeekId(''); }}
                    aria-label="Program"
                  >
                    <option value="">No program</option>
                    {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {programId && weeks.length > 0 && (
                    <>
                      <select
                        className="rounded-xl border border-border bg-card p-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        value={weekId}
                        onChange={e => { setWeekId(e.target.value); if (!title && dayIndex) setTitle(`Week ${(weeks.find((w: any) => w.id === e.target.value)?.weekIndex ?? '?')} Day ${dayIndex}`); }}
                        aria-label="Week"
                      >
                        <option value="">No week</option>
                        {weeks.map((w: any) => <option key={w.id} value={w.id}>Week {w.weekIndex}{w.phaseLabel ? ` — ${w.phaseLabel}` : ''}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">Day #</label>
                        <input type="number" min={1} max={7} value={dayIndex ?? ''}
                          onChange={e => { const d = Number(e.target.value); setDayIndex(d); if (!title && weekId) setTitle(`Week ${(weeks.find((w: any) => w.id === weekId)?.weekIndex ?? '?')} Day ${d}`); }}
                          className="w-full rounded-xl border border-border bg-card p-3 text-base focus:outline-none focus:ring-2 focus:ring-primary mt-1" aria-label="Day number" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-sm text-muted-foreground tracking-widest uppercase">
                Exercises {selectedExercises.length > 0 && <span className="text-foreground">({selectedExercises.length})</span>}
              </h2>
              {selectedExercises.length > 0 && (
                <span className="text-xs text-muted-foreground">{totalSets} total sets · ~{estimatedMinutes} min</span>
              )}
            </div>

            {selectedExercises.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                  <Dumbbell className="h-8 w-8 text-muted-foreground/40" />
                  <p className="font-bold text-muted-foreground">No exercises yet</p>
                  <p className="text-sm text-muted-foreground max-w-sm">Search and click <strong>+</strong> on exercises from the library panel on the left to add them here.</p>
                </CardContent>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={selectedExercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {selectedExercises.map((ex, i) => (
                      <SortableCard
                        key={ex.id}
                        exercise={ex}
                        index={i}
                        isExpanded={expandedIds.has(ex.id)}
                        onToggleExpand={toggleExpand}
                        onUpdate={updateExercise}
                        onRemove={removeExercise}
                        onPlayVideo={(url) => setVideoUrl(url)}
                        onToggleSuperset={toggleSuperset}
                        nextSupersetGroup={nextSupersetGroup(selectedExercises)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </main>
      </div>

      <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center gap-4 text-sm">
          {status ? (
            <span className={status.includes('Failed') ? 'text-pulse' : 'text-emerald'}>{status}</span>
          ) : selectedExercises.length > 0 ? (
            <span className="text-muted-foreground">
              <strong className="text-foreground">{selectedExercises.length}</strong> exercises · <strong className="text-foreground">{totalSets}</strong> total sets · ~{estimatedMinutes} min
            </span>
          ) : (
            <span className="text-muted-foreground">Add exercises from the library to build your workout.</span>
          )}
        </div>
        <Button onClick={handleSave} disabled={!title.trim() || saving}>
          {saving ? 'Saving...' : editId ? 'Update workout' : 'Save workout'}
        </Button>
      </div>

      {videoUrl && <VideoPlayerModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}
    </div>
  );
}
