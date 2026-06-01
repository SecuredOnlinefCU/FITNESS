import { apiFetch } from '@/lib/api/client';

interface RiskScanResult {
  clientsScanned: number;
  flagsCreated: number;
  flagsUpdated: number;
  items: any[];
}

export interface RiskScanFullResult {
  lowAdherence: RiskScanResult;
  stalledProgress: RiskScanResult;
  paymentRisk: RiskScanResult;
}

export const riskSignalsV2Api = {
  scanFull() {
    return apiFetch<RiskScanFullResult>('/api/coach-intelligence/risk-signals-v2/scan/full', { method: 'POST' });
  },
  scanLowAdherence() {
    return apiFetch<RiskScanResult>('/api/coach-intelligence/risk-signals-v2/scan/low-adherence', { method: 'POST' });
  },
  scanStalledProgress() {
    return apiFetch<RiskScanResult>('/api/coach-intelligence/risk-signals-v2/scan/stalled-progress', { method: 'POST' });
  },
  scanPaymentRisk() {
    return apiFetch<RiskScanResult>('/api/coach-intelligence/risk-signals-v2/scan/payment-risk', { method: 'POST' });
  },
};
