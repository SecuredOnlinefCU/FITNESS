import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

export const paymentsApi = {
  createPackage(input: { title: string; priceCents: number; currency: string; billingType: string; interval?: string }) {
    return apiFetch('/api/payments/packages', { method: 'POST', body: JSON.stringify(input) });
  },
  listPackages() {
    return apiFetch<ApiList<any>>('/api/payments/packages');
  },
  listSubscriptions() {
    return apiFetch<ApiList<any>>('/api/payments/subscriptions');
  },
  listPayments() {
    return apiFetch<ApiList<any>>('/api/payments/payments');
  },
};
