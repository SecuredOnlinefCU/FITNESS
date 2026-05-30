'use client';

import { useState } from 'react';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function WorkoutBuilderShell() {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function createWorkout() {
    setStatus('Creating workout...');
    try {
      await trainingApi.createWorkout({ title, exercises: [] });
      setStatus('Workout shell created. Add exercises next.');
      setTitle('');
    } catch (error: any) {
      setStatus(error.message || 'Failed to create workout.');
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-black">Workout builder</h2>
          <p className="text-sm text-muted-foreground">Create reusable workouts and assign them to clients.</p>
        </div>
        <Input placeholder="Workout title" value={title} onChange={(event) => setTitle(event.target.value)} />
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button onClick={createWorkout} disabled={!title}>Create workout</Button>
      </CardContent>
    </Card>
  );
}
