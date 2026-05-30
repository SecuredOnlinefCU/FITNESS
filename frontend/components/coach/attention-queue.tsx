import { AlertCircle, CheckSquare, MessageSquare, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const items = [
  { icon: CheckSquare, title: 'Tasks waiting for review', count: '0', detail: 'Client submissions will appear here.' },
  { icon: Video, title: 'Video form checks', count: '0', detail: 'Review movement videos and give feedback.' },
  { icon: MessageSquare, title: 'Unread client messages', count: '0', detail: 'Stay close to client questions.' },
  { icon: AlertCircle, title: 'Open reports or alerts', count: '0', detail: 'Moderation and system issues.' },
];

export function AttentionQueue() {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-xl font-black">Attention queue</h2>
        <p className="mb-4 text-sm text-slate-500">The highest-signal items that need coach action.</p>
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.detail}</p>
                </div>
                <p className="text-2xl font-black">{item.count}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
