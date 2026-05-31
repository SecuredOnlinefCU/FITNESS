'use client';

import { useState, useEffect } from 'react';
import { trainingApi } from '@/lib/api/modules/training';
import { Button } from '@/components/ui/button';

export function AssignWorkoutModal({ workoutId, onClose, onAssigned }: { workoutId: string; onClose: () => void; onAssigned: () => void }) {
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
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
      await trainingApi.assignWorkout({ workoutId, clientUserId: selectedClient });
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
        <h2 className="text-lg font-black">Assign workout</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a client to assign this workout to.</p>

        <div className="mt-4 space-y-3">
          <select
            className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            <option value="">Select a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.email || c.id.slice(0, 12)}</option>)}
          </select>

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
