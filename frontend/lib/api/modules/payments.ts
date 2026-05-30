import { apiFetch } from '@/lib/api/client';

export const paymentsApi = {
  createPackage(input: { title: string; priceCents: number; currency: string; billingType: string; interval?: string }) {
    return apiFetch('/api/payments/packages', { method: 'POST', body: JSON.stringify(input) });
  },
  listPackages() {
    return apiFetch<{ items: any[] }>('/api/payments/packages');
  },
};
