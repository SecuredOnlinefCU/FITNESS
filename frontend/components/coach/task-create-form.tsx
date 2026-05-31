'use client';

import { useState } from 'react';
import { tasksApi } from '@/lib/api/modules/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckSquare, Video, ClipboardList, Target } from 'lucide-react';

const TASK_TYPES = [
  { value: 'HABIT', label: 'Habit', icon: CheckSquare },
  { value: 'VIDEO', label: 'Video review', icon: Video },
  { value: 'FORM', label: 'Form', icon: ClipboardList },
  { value: 'REVIEWABLE', label: 'Reviewable work', icon: Target },
];

export function TaskCreateForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('HABIT');
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setStatus('Creating task...');
    try {
      await tasksApi.createTask({ title: title.trim(), description: description.trim() || undefined, taskType });
      setTitle('');
      setDescription('');
      setTaskType('HABIT');
      setStatus('Task created!');
      setTimeout(() => { setStatus(null); onCreated(); }, 800);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-black">Create task</h2>
          <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <div>
            <p className="mb-2 text-sm font-bold text-muted-foreground">Task type</p>
            <div className="flex flex-wrap gap-2">
              {TASK_TYPES.map(t => {
                const Icon = t.icon;
                const active = taskType === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setTaskType(t.value)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    <Icon className="h-4 w-4" />{t.label}
                  </button>
                );
              })}
            </div>
          </div>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
          <Button type="submit" disabled={!title.trim() || saving}>
            {saving ? 'Creating...' : 'Create task'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
