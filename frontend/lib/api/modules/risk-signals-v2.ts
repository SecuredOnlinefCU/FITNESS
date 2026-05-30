import { apiFetch } from '@/lib/api/client';

export const riskSignalsV2Api = {
  scanFull() {
    return apiFetch('/api/coach-intelligence/risk-signals-v2/scan/full', { method: 'POST' });
  },
  scanLowAdherence() {
    return apiFetch('/api/coach-intelligence/risk-signals-v2/scan/low-adherence', { method: 'POST' });
  },
  scanStalledProgress() {
    return apiFetch('/api/coach-intelligence/risk-signals-v2/scan/stalled-progress', { method: 'POST' });
  },
  scanPaymentRisk() {
    return apiFetch('/api/coach-intelligence/risk-signals-v2/scan/payment-risk', { method: 'POST' });
  },
};
