'use client';

import { clientHealthApi } from '@/lib/api/modules/client-health';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CoachActionRecommendationList({ items = [], onCompleted }: { items?: any[]; onCompleted?: () => void }) {
  async function complete(id: string) {
    await clientHealthApi.completeRecommendation(id);
    onCompleted?.();
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-xl font-black">Recommended coach actions</h2>
        <div className="mt-4 space-y-3">
          {items.length ? items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 rounded-2xl border border-border p-4">
              <div>
                <p className="font-black">{item.title}</p>
                <p className="text-sm text-slate-500">{item.body}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{item.recommendationType} • Priority {item.priority}</p>
              </div>
              <Button variant="secondary" onClick={() => complete(item.id)}>Done</Button>
            </div>
          )) : <p className="text-sm text-slate-500">No open recommendations.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
