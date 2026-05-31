'use client';

import { AlertTriangle } from 'lucide-react';
import { coachIntelligenceApi } from '@/lib/api/modules/coach-intelligence';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RiskFlag {
  id: string;
  title: string;
  body?: string;
  flagType: string;
  severity: string;
}

export function ClientRiskFlagCard({ flag, onResolved }: { flag: RiskFlag; onResolved?: () => void }) {
  async function resolve() {
    await coachIntelligenceApi.resolveRiskFlag(flag.id);
    onResolved?.();
  }

  return (
    <Card className={flag.severity === 'HIGH' || flag.severity === 'CRITICAL' ? 'border-pulse/30 bg-pulse/5' : ''}>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 h-5 w-5 text-primary" />
          <div>
            <p className="font-black">{flag.title}</p>
            <p className="text-sm text-muted-foreground">{flag.body}</p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">{flag.flagType} • {flag.severity}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={resolve}>Resolve</Button>
      </CardContent>
    </Card>
  );
}
