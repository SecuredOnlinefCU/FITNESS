'use client';

import { useState } from 'react';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus } from 'lucide-react';

export function RecipeLibrary() {
  const result = useAsyncData(() => nutritionApi.listRecipes(), []);
  const recipes = result.data?.items ?? [];
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      await nutritionApi.createRecipe({ title: title.trim(), instructions: instructions.trim() || undefined });
      setTitle('');
      setInstructions('');
      setShowForm(false);
      result.reload();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to create recipe.');
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black">Recipe library</h2>
          </div>
          <Button variant="ghost" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" />Add</Button>
        </div>

        {showForm && (
          <div className="mt-3 space-y-3 rounded-xl border border-border p-4">
            <Input placeholder="Recipe name" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Instructions"
              rows={3}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
            {status && <p className="text-sm text-muted-foreground">{status}</p>}
            <Button onClick={handleCreate} disabled={!title.trim()}>Save recipe</Button>
          </div>
        )}

        {result.loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No recipes yet. Add your first recipe above.</p>
        ) : (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {recipes.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-border p-3">
                <p className="font-bold text-sm">{r.title}</p>
                {r.instructions && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{r.instructions}</p>}
                <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                  {r.calories && <span>{r.calories} cal</span>}
                  {r.protein && <span>P: {r.protein}g</span>}
                  {r.carbs && <span>C: {r.carbs}g</span>}
                  {r.fat && <span>F: {r.fat}g</span>}
                  <span>{r.ingredients?.length ?? 0} ingredients</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
