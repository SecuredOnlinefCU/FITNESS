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
      status === 'open' ? 'bg-emerald-100 text-emerald-700' :
      status === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
      status === 'error' ? 'bg-red-100 text-red-700' :
      'bg-slate-100 text-slate-600'
    )}>
      {labels[status]}
    </span>
  );
}
