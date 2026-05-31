'use client';

import { useState } from 'react';
import { riskSignalsV2Api } from '@/lib/api/modules/risk-signals-v2';
import type { RiskScanFullResult } from '@/lib/api/modules/risk-signals-v2';

export function useRiskSignalsV2() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskScanFullResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(scan: 'full' | 'low' | 'stalled' | 'payment') {
    setLoading(true);
    setError(null);
    try {
      const data = scan === 'full'
        ? await riskSignalsV2Api.scanFull()
        : scan === 'low'
          ? await riskSignalsV2Api.scanLowAdherence()
          : scan === 'stalled'
            ? await riskSignalsV2Api.scanStalledProgress()
            : await riskSignalsV2Api.scanPaymentRisk();
      setResult(data as RiskScanFullResult);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Risk scan failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, result, error, run };
}
