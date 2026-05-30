import { Card, CardContent } from '@/components/ui/card';

export function RiskFlagTimeline({ items = [] }: { items?: any[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-xl font-black">Risk timeline</h2>
        <div className="mt-4 space-y-3">
          {items.length ? items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <p className="font-black">{item.title}</p>
              <p className="text-sm text-slate-500">{item.body}</p>
              <p className="mt-1 text-xs text-slate-400">{item.eventType} • {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No timeline events yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
