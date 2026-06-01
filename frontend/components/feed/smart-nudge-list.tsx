'use client';

import { Bell, AlertTriangle, Info, X, ArrowRight } from 'lucide-react';
import type { CoachNudge } from '@/lib/types/domain';
import { Button } from '@/components/ui/button';

const priorityConfig = {
  high: { icon: <AlertTriangle className="h-4 w-4" />, color: 'border-pulse/30 bg-pulse/5 text-pulse' },
  medium: { icon: <Bell className="h-4 w-4" />, color: 'border-energy/30 bg-energy/5 text-energy' },
  low: { icon: <Info className="h-4 w-4" />, color: 'border-flow/30 bg-flow/5 text-flow' },
};

export function SmartNudgeList({ nudges, onDismiss }: { nudges: CoachNudge[]; onDismiss?: (idx: number) => void }) {
  if (nudges.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-foreground">Coach nudges</h3>
      {nudges.map((n, i) => {
        const pc = priorityConfig[n.priority];
        return (
          <div key={i} className={`flex items-start gap-3 rounded-xl border p-3 ${pc.color}`}>
            <span className="mt-0.5 shrink-0">{pc.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{n.message}</p>
              {n.action && (
                <Button className="mt-2 h-7 text-xs px-3" onClick={() => {}}>
                  {n.action!.label} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
            {onDismiss && (
              <button onClick={() => onDismiss(i)} className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100 transition">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
