'use client';

import { useState } from 'react';
import { programsApi } from '@/lib/api/modules/programs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ProgramBuilderShell() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function createProgram() {
    setStatus('Creating program...');
    try {
      await programsApi.createProgram({ name, description });
      setStatus('Program created. You can now add clients and content.');
      setName('');
      setDescription('');
    } catch (error: any) {
      setStatus(error.message || 'Failed to create program.');
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-black">Create program</h2>
          <p className="text-sm text-muted-foreground">Start with the structure. Add workouts, feed, tasks, and nutrition after.</p>
        </div>
        <Input placeholder="Program name" value={name} onChange={(event) => setName(event.target.value)} />
        <Input placeholder="Short description" value={description} onChange={(event) => setDescription(event.target.value)} />
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button onClick={createProgram} disabled={!name}>Create program</Button>
      </CardContent>
    </Card>
  );
}
