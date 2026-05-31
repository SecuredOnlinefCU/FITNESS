'use client';

import { useState } from 'react';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, X, ChevronDown, ChevronUp, Apple } from 'lucide-react';
import type { NutritionPlan, NutritionDay, NutritionMeal } from '@/lib/types/domain';

const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack', OTHER: 'Other' };
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

type DayForm = { dayIndex: number; meals: MealForm[] };
type MealForm = { mealType: string; title: string; calories: string; protein: string; carbs: string; fat: string; instructions: string };

function emptyDay(index: number): DayForm {
  return { dayIndex: index, meals: [] };
}

function emptyMeal(mealType: string): MealForm {
  return { mealType, title: '', calories: '', protein: '', carbs: '', fat: '', instructions: '' };
}

function templateDays(count: number): DayForm[] {
  return Array.from({ length: count }, (_, i) => emptyDay(i));
}

export function StructuredPlanBuilder({ clientUserId, plan, onClose, onSaved }: { clientUserId: string; plan?: NutritionPlan | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(plan?.title ?? '');
  const [notes, setNotes] = useState(plan?.notes ?? '');
  const [dayCount, setDayCount] = useState(plan?.days?.length ?? 7);
  const [days, setDays] = useState<DayForm[]>(() => {
    if (plan?.days && plan.days.length > 0) {
      return plan.days.map((d) => ({
        dayIndex: d.dayIndex,
        meals: d.meals?.map((m) => ({
          mealType: m.mealType, title: m.title ?? '', calories: m.calories?.toString() ?? '',
          protein: m.protein?.toString() ?? '', carbs: m.carbs?.toString() ?? '', fat: m.fat?.toString() ?? '', instructions: m.instructions ?? '',
        })) ?? [],
      }));
    }
    return templateDays(7);
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addMeal(dayIdx: number, mealType: string) {
    setDays((prev) => prev.map((d, i) => i === dayIdx ? { ...d, meals: [...d.meals, emptyMeal(mealType)] } : d));
  }

  function removeMeal(dayIdx: number, mealIdx: number) {
    setDays((prev) => prev.map((d, i) => i === dayIdx ? { ...d, meals: d.meals.filter((_, mi) => mi !== mealIdx) } : d));
  }

  function updateMeal(dayIdx: number, mealIdx: number, field: keyof MealForm, value: string) {
    setDays((prev) => prev.map((d, i) => i === dayIdx ? { ...d, meals: d.meals.map((m, mi) => mi === mealIdx ? { ...m, [field]: value } : m) } : d));
  }

  function addDay() {
    setDays((prev) => [...prev, emptyDay(prev.length)]);
  }

  function removeDay(dayIdx: number) {
    setDays((prev) => prev.filter((_, i) => i !== dayIdx));
  }

  async function handleSave() {
    if (!title.trim()) { setError('Plan title is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = plan
        ? await nutritionApi.updatePlan(plan.id, { title: title.trim(), notes: notes.trim() || undefined })
        : await nutritionApi.createPlan({ clientUserId, planType: 'STRUCTURED', title: title.trim(), notes: notes.trim() || undefined });
      const planId = saved.id;
      const existingDayMap = new Map((plan?.days ?? []).map((d) => [d.dayIndex, d]));

      for (const day of days) {
        const existing = existingDayMap.get(day.dayIndex);
        let dayId = existing?.id;
        if (existing && day.meals.length === 0) {
          await nutritionApi.deletePlanDay(planId, existing.id);
          continue;
        }
        if (!existing) {
          dayId = (await nutritionApi.addPlanDay(planId, day.dayIndex)).id;
        }
        const existingMealMap = new Map((existing?.meals ?? []).map((m) => [m.id, m]));
        const usedIds = new Set<string>();
        for (const meal of day.meals) {
          const match = Array.from(existingMealMap.values()).find((m) => m.mealType === meal.mealType);
          if (match) {
            usedIds.add(match.id);
            await nutritionApi.updateMeal(match.id, {
              mealType: meal.mealType, title: meal.title.trim() || undefined,
              calories: meal.calories ? Number(meal.calories) : undefined,
              protein: meal.protein ? Number(meal.protein) : undefined,
              carbs: meal.carbs ? Number(meal.carbs) : undefined,
              fat: meal.fat ? Number(meal.fat) : undefined,
              instructions: meal.instructions.trim() || undefined,
            });
          } else {
            await nutritionApi.addDayMeal(dayId!, {
              mealType: meal.mealType, title: meal.title.trim() || undefined,
              calories: meal.calories ? Number(meal.calories) : undefined,
              protein: meal.protein ? Number(meal.protein) : undefined,
              carbs: meal.carbs ? Number(meal.carbs) : undefined,
              fat: meal.fat ? Number(meal.fat) : undefined,
              instructions: meal.instructions.trim() || undefined,
            });
          }
        }
        for (const [id, m] of existingMealMap) {
          if (!usedIds.has(id)) await nutritionApi.deleteMeal(id);
        }
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl bg-pulse/10 p-3 text-sm text-pulse" role="alert">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Plan title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 7-Day Fat Loss Plan" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Notes (optional)</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the client" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{days.length} days</span>
          <button onClick={addDay} className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-bold hover:bg-ink-800"><Plus className="h-3 w-3" /> Add day</button>
          <button onClick={() => setDays(templateDays(dayCount))} className="rounded-xl bg-muted px-3 py-1.5 text-xs font-bold hover:bg-ink-800">Reset to {dayCount} days</button>
        </div>
        <Input type="number" value={dayCount} onChange={(e) => setDayCount(Number(e.target.value))} className="w-20 text-sm" min={1} max={31} />
      </div>

      {days.map((day, di) => (
        <DayEditor key={di} day={day} dayLabel={`Day ${di + 1}`} onRemove={() => removeDay(di)} onAddMeal={(mt) => addMeal(di, mt)} onRemoveMeal={(mi) => removeMeal(di, mi)} onUpdateMeal={(mi, f, v) => updateMeal(di, mi, f, v)} />
      ))}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || !title.trim()}>{saving ? 'Saving...' : plan ? 'Update plan' : 'Create plan'}</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

function DayEditor({ day, dayLabel, onRemove, onAddMeal, onRemoveMeal, onUpdateMeal }: {
  day: DayForm; dayLabel: string; onRemove: () => void; onAddMeal: (mealType: string) => void; onRemoveMeal: (mealIdx: number) => void;
  onUpdateMeal: (mealIdx: number, field: keyof MealForm, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card>
      <CardContent className="p-4">
        <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between text-left" aria-expanded={expanded}>
          <div className="flex items-center gap-2">
            <Apple className="h-4 w-4 text-primary" />
            <span className="font-bold">{dayLabel}</span>
            <span className="text-xs text-muted-foreground">({day.meals.length} meals)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="rounded-lg p-1 text-muted-foreground hover:text-pulse" title="Remove day"><Trash2 className="h-4 w-4" /></button>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {day.meals.map((meal, mi) => (
              <div key={mi} className="rounded-xl bg-muted p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{MEAL_LABELS[meal.mealType] || meal.mealType}</span>
                  <select value={meal.mealType} onChange={(e) => onUpdateMeal(mi, 'mealType', e.target.value)} className="rounded-lg bg-card px-2 py-1 text-xs focus:outline-none">
                    {MEAL_TYPES.map((t) => <option key={t} value={t}>{MEAL_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <input value={meal.title} onChange={(e) => onUpdateMeal(mi, 'title', e.target.value)} placeholder="Meal name" className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <input value={meal.calories} onChange={(e) => onUpdateMeal(mi, 'calories', e.target.value)} type="number" placeholder="Cal" className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input value={meal.protein} onChange={(e) => onUpdateMeal(mi, 'protein', e.target.value)} type="number" placeholder="Protein (g)" className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <input value={meal.carbs} onChange={(e) => onUpdateMeal(mi, 'carbs', e.target.value)} type="number" placeholder="Carbs (g)" className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <input value={meal.fat} onChange={(e) => onUpdateMeal(mi, 'fat', e.target.value)} type="number" placeholder="Fat (g)" className="w-full rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex gap-1">
                    <input value={meal.instructions} onChange={(e) => onUpdateMeal(mi, 'instructions', e.target.value)} placeholder="Instructions" className="flex-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button onClick={() => onRemoveMeal(mi)} className="rounded-lg p-1.5 text-muted-foreground hover:text-pulse" title="Remove meal"><X className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.filter((mt) => !day.meals.some((m) => m.mealType === mt)).map((mt) => (
                <button key={mt} onClick={() => onAddMeal(mt)} className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-ink-800"><Plus className="h-3 w-3" />{MEAL_LABELS[mt]}</button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
