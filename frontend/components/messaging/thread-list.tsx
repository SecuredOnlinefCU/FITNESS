'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Thread {
  id: string;
  coachUserId: string;
  clientUserId: string;
  status: string;
  messages?: { id: string; bodyText?: string; createdAt: string }[];
}

interface ThreadListProps {
  threads: Thread[];
}

export function ThreadList({ threads }: ThreadListProps) {
  if (!threads.length) return <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>;
  return (
    <div className="space-y-2 p-2">
      {threads.map((thread) => (
        <Card key={thread.id}>
          <CardContent className="p-3">
            <p className="text-sm font-medium">Thread {thread.id.slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">{thread.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
