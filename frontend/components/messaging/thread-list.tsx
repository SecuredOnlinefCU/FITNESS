import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { Thread } from '@/lib/types/domain';

interface ThreadListProps {
  threads: Thread[];
  getThreadHref?: (thread: Thread) => string;
  participantName?: (thread: Thread) => string;
}

export function ThreadList({ threads, getThreadHref, participantName }: ThreadListProps) {
  if (!threads.length) return <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>;
  return (
    <div className="space-y-2 p-2">
      {threads.map((thread) => {
        const lastMessage = thread.messages?.[thread.messages.length - 1];
        const name = participantName?.(thread) || (thread.clientUserId === thread.coachUserId ? 'Coach' : 'Client');
        const href = getThreadHref?.(thread);
        const inner = (
          <CardContent className="p-3">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{lastMessage?.bodyText?.slice(0, 60) || thread.status}</p>
          </CardContent>
        );
        return (
          <Card key={thread.id}>
            {href ? <Link href={href} className="block">{inner}</Link> : inner}
          </Card>
        );
      })}
    </div>
  );
}
