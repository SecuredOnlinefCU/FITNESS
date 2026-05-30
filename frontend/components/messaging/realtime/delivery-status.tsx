import { Check, CheckCheck, Clock, WifiOff, AlertCircle } from 'lucide-react';
import type { MessageDeliveryStatus } from '@/lib/realtime/message-types';

export function DeliveryStatus({ status }: { status?: MessageDeliveryStatus }) {
  if (!status) return null;
  const iconClass = 'h-3.5 w-3.5';

  if (status === 'queued' || status === 'connecting') return <span className="inline-flex items-center gap-1 text-[11px] opacity-70"><Clock className={iconClass} />Queued</span>;
  if (status === 'sent') return <span className="inline-flex items-center gap-1 text-[11px] opacity-70"><Check className={iconClass} />Sent</span>;
  if (status === 'delivered') return <span className="inline-flex items-center gap-1 text-[11px] opacity-70"><CheckCheck className={iconClass} />Delivered</span>;
  if (status === 'read') return <span className="inline-flex items-center gap-1 text-[11px] opacity-70"><CheckCheck className={iconClass} />Read</span>;
  if (status === 'failed') return <span className="inline-flex items-center gap-1 text-[11px] text-red-600"><AlertCircle className={iconClass} />Failed</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] opacity-70"><WifiOff className={iconClass} />Offline</span>;
}
