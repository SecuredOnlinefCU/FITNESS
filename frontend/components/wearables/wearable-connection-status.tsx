'use client';

import { Watch } from 'lucide-react';
import { useWearableConnections } from '@/hooks/wearables/use-wearable-connections';
import { wearablesApi } from '@/lib/api/modules/wearables';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListSkeleton } from '@/components/states/skeleton';

export function WearableConnectionStatus() {
  const connections = useWearableConnections();
  async function connectManual() { await wearablesApi.connect({ provider: 'MANUAL', status: 'CONNECTED' }); await connections.reload(); }
  if (connections.loading) return <ListSkeleton rows={2} />;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><Watch className="h-5 w-5 text-primary" /><div><h2 className="text-xl font-black">Wearable connections</h2><p className="text-sm text-slate-500">Sync sleep, steps, and readiness signals.</p></div></div>
          <Button onClick={connectManual}>Add manual source</Button>
        </div>
        <div className="space-y-2">
          {(connections.data?.items || []).length ? connections.data!.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border p-3"><p className="font-bold">{item.provider}</p><p className="text-sm text-slate-500">{item.status}</p></div>
          )) : <p className="text-sm text-slate-500">No wearable connected yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
