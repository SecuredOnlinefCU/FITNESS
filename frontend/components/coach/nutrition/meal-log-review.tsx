'use client';

import { useAsyncData } from '@/hooks/data/use-async-data';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner', SNACK: 'Snack', OTHER: 'Other' };

export function MealLogReview({ clientUserId }: { clientUserId?: string }) {
  const result = useAsyncData(() => nutritionApi.listMealLogs(clientUserId), [clientUserId]);
  const items = result.data?.items ?? [];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Meal log review</h2>
        </div>
        {result.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading meal logs...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No meal logs recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {items.slice(0, 20).map((log: any) => (
              <div key={log.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{MEAL_LABELS[log.mealType] ?? log.mealType}</span>
                    <span className="text-sm font-bold">{log.title ?? 'Quick log'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.mealTime ?? log.createdAt).toLocaleDateString()}</span>
                </div>
                {(log.calories || log.protein || log.carbs || log.fat) ? (
                  <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                    {log.calories && <span>{log.calories} cal</span>}
                    {log.protein && <span>P: {log.protein}g</span>}
                    {log.carbs && <span>C: {log.carbs}g</span>}
                    {log.fat && <span>F: {log.fat}g</span>}
                  </div>
                ) : null}
                {log.notes && <p className="mt-1 text-xs text-muted-foreground italic">{log.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
