import { Card, CardContent } from '@/components/ui/card';
import type { Thread } from '@/lib/types/domain';

interface ThreadListProps {
  threads: Thread[];
}

export function ThreadList({ threads }: ThreadListProps) {
  if (!threads.length) return <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>;
  return (
    <div className="space-y-2 p-2">
      {threads.map((thread) => {
        const lastMessage = thread.messages?.[thread.messages.length - 1];
        return (
          <Card key={thread.id}>
            <CardContent className="p-3">
              <p className="text-sm font-medium">Conversation with {thread.clientUserId === thread.coachUserId ? 'Coach' : 'Client'}</p>
              <p className="text-xs text-muted-foreground">{lastMessage?.bodyText?.slice(0, 60) || thread.status}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
