import { apiFetch } from '@/lib/api/client';

export const checkinsApi = {
  upsertExpectation(input: { clientUserId: string; cadence?: string; expectedEveryDays?: number; nextDueAt?: string }) {
    return apiFetch('/api/checkins/expectations', { method: 'POST', body: JSON.stringify(input) });
  },
  recordMyCheckIn(coachUserId: string) {
    return apiFetch('/api/checkins/me', { method: 'POST', body: JSON.stringify({ coachUserId }) });
  },
};
