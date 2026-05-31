'use client';

import { useState, useEffect } from 'react';
import { tasksApi } from '@/lib/api/modules/tasks';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';

export function TaskAssignDialog({ taskId, onClose, onAssigned }: { taskId: string; onClose: () => void; onAssigned: () => void }) {
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    trainingApi.listCoachClients().then(r => setClients(r.items)).catch(() => {});
  }, []);

  async function handleAssign() {
    if (!selectedClient) return;
    setSaving(true);
    setStatus('Assigning...');
    try {
      await tasksApi.assignTask(taskId, {
        clientUserId: selectedClient,
        dueAt: dueDate || undefined,
        recurrenceRule: isRecurring ? 'FREQ=WEEKLY' : undefined,
      });
      setStatus('Assigned!');
      setTimeout(onAssigned, 1000);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to assign.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-black">Assign task</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a client and set a due date.</p>

        <div className="mt-4 space-y-3">
          <select
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email || c.id.slice(0, 12)}</option>)}
          </select>

          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="rounded border-border" />
            Recurring (weekly)
          </label>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedClient || saving}>
            {saving ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </div>
    </div>
  );
}
