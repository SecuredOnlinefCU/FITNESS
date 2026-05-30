import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

export const adminExtendedApi = {
  dashboard() {
    return apiFetch<{ users: number; programs: number; openReports: number }>('/api/admin/dashboard');
  },
  updateUserStatus(userId: string, status: 'active' | 'suspended' | 'disabled') {
    return apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  auditLogs() {
    return apiFetch<ApiList<any>>('/api/admin/audit-logs');
  },

  // These endpoints are shells for the production backend to expose later.
  // UI screens degrade gracefully if the endpoints are not available yet.
  users() {
    return apiFetch<ApiList<any>>('/api/admin/users');
  },
  reports() {
    return apiFetch<ApiList<any>>('/api/admin/reports');
  },
  featureFlags() {
    return apiFetch<ApiList<any>>('/api/admin/feature-flags');
  },
  deliveryLogs() {
    return apiFetch<ApiList<any>>('/api/admin/delivery-logs');
  },
  webhookEvents() {
    return apiFetch<ApiList<any>>('/api/admin/webhooks/stripe-events');
  },
};
