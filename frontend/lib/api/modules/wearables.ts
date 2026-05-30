import { apiFetch } from '@/lib/api/client';

export const wearablesApi = {
  connections() { return apiFetch<{ items: any[] }>('/api/wearables/connections'); },
  connect(input: { provider: string; status?: string; externalAccountId?: string; scopesJson?: any; metadataJson?: any }) { return apiFetch('/api/wearables/connections', { method: 'POST', body: JSON.stringify(input) }); },
  disconnect(provider: string) { return apiFetch(`/api/wearables/connections/${provider}/disconnect`, { method: 'POST' }); },
};
