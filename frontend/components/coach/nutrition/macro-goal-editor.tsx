'use client';

import { useState } from 'react';
import { nutritionApi } from '@/lib/api/modules/nutrition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target } from 'lucide-react';

export function MacroGoalEditor({ clientUserId }: { clientUserId: string }) {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleSave() {
    if (!clientUserId) return;
    try {
      await nutritionApi.createPlan({
        clientUserId,
        planType: 'MACRO_ONLY',
        title: 'Macro targets',
      });
      setStatus('Macro targets created!');
      setTimeout(() => setStatus(null), 2000);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save macro targets.');
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black">Macro targets</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Set daily nutrition targets for this client.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Calories</p>
            <Input type="number" placeholder="2000" value={calories} onChange={e => setCalories(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Protein (g)</p>
            <Input type="number" placeholder="150" value={protein} onChange={e => setProtein(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Carbs (g)</p>
            <Input type="number" placeholder="200" value={carbs} onChange={e => setCarbs(e.target.value)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Fat (g)</p>
            <Input type="number" placeholder="65" value={fat} onChange={e => setFat(e.target.value)} />
          </div>
        </div>
        {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
        <Button className="mt-3" onClick={handleSave} disabled={!clientUserId}>Save targets</Button>
      </CardContent>
    </Card>
  );
}
