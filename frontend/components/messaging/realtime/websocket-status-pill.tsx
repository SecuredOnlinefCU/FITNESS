import { cn } from '@/lib/utils';
import type { RealtimeConnectionStatus } from '@/lib/realtime/websocket-client';

const labels: Record<RealtimeConnectionStatus, string> = {
  idle: 'Idle',
  connecting: 'Connecting',
  open: 'Live',
  closed: 'Offline',
  error: 'Connection issue',
};

export function WebSocketStatusPill({ status }: { status: RealtimeConnectionStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-black',
      status === 'open' ? 'bg-flow/15 text-flow' :
      status === 'connecting' ? 'bg-energy/15 text-energy' :
      status === 'error' ? 'bg-pulse/15 text-pulse' :
      'bg-muted text-muted-foreground'
    )}>
      {labels[status]}
    </span>
  );
}
