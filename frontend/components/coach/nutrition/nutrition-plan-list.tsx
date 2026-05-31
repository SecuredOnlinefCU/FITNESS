'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Utensils } from 'lucide-react';
import type { NutritionPlan } from '@/lib/types/domain';

export function NutritionPlanList({ clientUserId, onEdit }: { clientUserId?: string; onEdit?: (plan: NutritionPlan) => void }) {
  const result = useAsyncData(() => nutritionApi.listPlans(clientUserId), [clientUserId]);
  const items = result.data?.items ?? [];

  async function handleDelete(id: string) {
    if (!confirm('Delete this plan?')) return;
    try {
      await nutritionApi.deletePlan(id);
      result.reload();
    } catch { /* ignore */ }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Meal plans</h2>
        </div>
        {result.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading plans...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No meal plans for this client.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((p) => {
              const totalDays = p.days?.length ?? 0;
              const totalMeals = p.days?.reduce((s, d) => s + (d.meals?.length ?? 0), 0) ?? 0;
              return (
                <div key={p.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{p.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{p.planType}</span>
                      {onEdit && <button onClick={() => onEdit(p)} className="rounded-lg p-1 text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>}
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1 text-muted-foreground hover:text-pulse"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {p.notes && <p className="mt-1 text-sm text-muted-foreground">{p.notes}</p>}
                  <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                    <span>{totalDays} days</span>
                    <span>{totalMeals} meals</span>
                    {p.startDate && <span>From {new Date(p.startDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
