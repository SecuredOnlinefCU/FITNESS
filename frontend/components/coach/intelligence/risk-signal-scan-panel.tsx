'use client';

import { ShieldAlert } from 'lucide-react';
import { useRiskSignalsV2 } from '@/hooks/coach-intelligence/use-risk-signals-v2';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function RiskSignalScanPanel({ onScanned }: { onScanned?: () => void }) {
  const scan = useRiskSignalsV2();

  async function run(type: 'full' | 'low' | 'stalled' | 'payment') {
    await scan.run(type);
    onScanned?.();
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-muted p-3 text-primary"><ShieldAlert className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-black">Risk signal scans</h2>
            <p className="text-sm text-muted-foreground">Detect low adherence, stalled progress, and payment/access risk.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={scan.loading} onClick={() => run('full')}>Run full scan</Button>
          <Button variant="secondary" disabled={scan.loading} onClick={() => run('low')}>Low adherence</Button>
          <Button variant="secondary" disabled={scan.loading} onClick={() => run('stalled')}>Stalled progress</Button>
          <Button variant="secondary" disabled={scan.loading} onClick={() => run('payment')}>Payment risk</Button>
        </div>
        {scan.error ? <p className="mt-3 text-sm text-red-600">{scan.error}</p> : null}
        {scan.result ? <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-muted p-4 text-xs">{JSON.stringify(scan.result, null, 2)}</pre> : null}
      </CardContent>
    </Card>
  );
}
