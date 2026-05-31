'use client';

import { useState, useEffect } from 'react';
import { progressApi } from '@/lib/api/modules/progress';
import { Users } from 'lucide-react';

export function ProgressClientSelector({ selectedId, onChange }: { selectedId: string; onChange: (id: string) => void }) {
  const [clients, setClients] = useState<{ id: string; firstName: string; lastName: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.listCoachClients().then(r => {
      setClients(r.items);
      if (!selectedId && r.items.length > 0) onChange(r.items[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <Users className="h-5 w-5 text-muted-foreground" />
      <select
        className="flex-1 bg-transparent text-sm font-bold text-foreground focus:outline-none"
        value={selectedId}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
      >
        {loading ? <option>Loading clients...</option> : null}
        {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
      </select>
    </div>
  );
}
