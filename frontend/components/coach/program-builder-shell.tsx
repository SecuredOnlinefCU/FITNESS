'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { programsApi } from '@/lib/api/modules/programs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ProgramBuilderShell({ editId }: { editId?: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    programsApi.getProgram(editId).then((p: any) => {
      setName(p.name ?? '');
      setDescription(p.description ?? '');
    }).catch(() => toast.error('Failed to load program'));
  }, [editId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setStatus(editId ? 'Updating program...' : 'Creating program...');
    try {
      if (editId) {
        await programsApi.updateProgram(editId, { name: name.trim(), description: description.trim() || undefined });
        setStatus('Program updated!');
      } else {
        await programsApi.createProgram({ name: name.trim(), description: description.trim() || undefined });
        setStatus('Program created!');
      }
      setTimeout(() => router.push('/coach/programs'), 1200);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to save program.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-black">{editId ? 'Edit program' : 'Create program'}</h2>
            <p className="text-sm text-muted-foreground">Start with the structure. Add workouts, feed, tasks, and nutrition after.</p>
          </div>
          <Input placeholder="Program name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input placeholder="Short description" value={description} onChange={(event) => setDescription(event.target.value)} />
          {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          <Button type="submit" disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : editId ? 'Update program' : 'Create program'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
