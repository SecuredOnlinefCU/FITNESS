'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils } from 'lucide-react';

export function NutritionPlanList({ clientUserId }: { clientUserId?: string }) {
  const result = useAsyncData(() => nutritionApi.listPlans(clientUserId), [clientUserId]);
  const items = result.data?.items ?? [];

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
            {items.map((p: any) => {
              const totalDays = p.days?.length ?? 0;
              const totalMeals = p.days?.reduce((s: number, d: any) => s + (d.meals?.length ?? 0), 0) ?? 0;
              return (
                <div key={p.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{p.title}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">{p.planType}</span>
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
