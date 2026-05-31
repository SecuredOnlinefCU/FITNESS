import { apiFetch } from '@/lib/api/client';
import type { ApiList, Subscription, Payment, CoachingPackage } from '@/lib/types/domain';

export const paymentsApi = {
  createPackage(input: { title: string; priceCents: number; currency: string; billingType: string; interval?: string }) {
    return apiFetch<CoachingPackage>('/api/payments/packages', { method: 'POST', body: JSON.stringify(input) });
  },
  listPackages() {
    return apiFetch<ApiList<CoachingPackage>>('/api/payments/packages');
  },
  listSubscriptions() {
    return apiFetch<ApiList<Subscription>>('/api/payments/subscriptions');
  },
  listPayments() {
    return apiFetch<ApiList<Payment>>('/api/payments/payments');
  },
};
