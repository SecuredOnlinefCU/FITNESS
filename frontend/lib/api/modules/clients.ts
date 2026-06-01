import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

export type ClientDossierUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  clientProfile?: { userId: string; displayName: string } | null;
};

export type ClientHealthScore = {
  score: number;
  healthStatus: string;
  adherenceScore: number;
  progressScore: number;
  engagementScore: number;
  paymentScore: number;
};

export type ClientDossier = {
  user: ClientDossierUser;
  clientProfile?: { userId: string; displayName: string; dateOfBirth?: string | null; gender?: string | null; heightCm?: number | null; startingWeight?: number | null; currentGoal?: string | null; goalTimeline?: string | null; currentPhase?: string | null; communicationStyle?: string | null; disciplineLevel?: string | null } | null;
  healthScore: ClientHealthScore | null;
  momentum: { score: number; trend: string; performanceScore: number; behaviorScore: number; engagementScore: number; recoveryScore: number } | null;
  plateaus: { exerciseId: string; exerciseName: string; status: string; currentMax: number; previousMax: number; changePercent: number; weeksAtLevel: number }[];
  overtraining: { risk: string; reason: string; sessionsThisWeek: number; avgReadiness: number; avgRPE: number };
  churnRisk: { level: string; score: number; factors: { factor: string; weight: number; detail: string }[] };
  smartActions: { id: string; type: string; priority: number; title: string; body: string; actionHref: string; reason: string }[];
  riskFlags: { id: string; flagType: string; severity: string; title: string; body?: string | null; status: string; createdAt: string }[];
  assignments: { id: string; workoutId: string; assignedForDate?: string | null; status?: string; createdAt?: string; workout?: { id: string; title: string; description?: string | null } | null }[];
  sessions: { id: string; startedAt?: string | null; completedAt?: string | null; status?: string; assignment?: { id: string; workout?: { id: string; title: string } | null } | null; sets?: { id: string; reps?: number | null; weight?: number | null }[] }[];
  metrics: { id: string; metricType: string; value: number; unit?: string | null; recordedAt?: string }[];
  notes: CoachClientNote[];
  programMemberships: { id: string; programId: string; clientUserId: string; status: string; joinedAt: string; program?: { id: string; name: string; description?: string | null; coachUserId: string } | null }[];
};

export type ClientGoal = {
  id: string;
  clientUserId: string;
  goalType: string;
  title: string;
  targetValue?: number | null;
  targetUnit?: string | null;
  currentValue?: number | null;
  startDate: string;
  targetDate?: string | null;
  status: string;
};

export type CoachClientNote = {
  id: string;
  coachUserId: string;
  clientUserId: string;
  content: string;
  createdAt: string;
};

export type CoachInvite = {
  id: string;
  coachUserId: string;
  email: string;
  displayName: string;
  programId?: string | null;
  status: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
};

export const clientsApi = {
  getDossier(clientUserId: string) {
    return apiFetch<ClientDossier>(`/api/clients/${clientUserId}`);
  },

  pendingInvites() {
    return apiFetch<ApiList<CoachInvite>>('/api/clients/pending-invites');
  },

  approveInvite(inviteId: string) {
    return apiFetch<{ success: boolean }>(`/api/clients/pending-invites/${inviteId}/approve`, { method: 'POST' });
  },

  declineInvite(inviteId: string) {
    return apiFetch<{ success: boolean }>(`/api/clients/pending-invites/${inviteId}/decline`, { method: 'POST' });
  },

  cancelInvite(inviteId: string) {
    return apiFetch<{ success: boolean }>(`/api/clients/pending-invites/${inviteId}`, { method: 'DELETE' });
  },

  getNotes(clientUserId: string) {
    return apiFetch<ApiList<CoachClientNote>>(`/api/clients/${clientUserId}/notes`);
  },

  addNote(clientUserId: string, content: string) {
    return apiFetch<CoachClientNote>(`/api/clients/${clientUserId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deleteNote(clientUserId: string, noteId: string) {
    return apiFetch<{ success: boolean }>(`/api/clients/${clientUserId}/notes/${noteId}`, { method: 'DELETE' });
  },

  inviteClient(input: { email: string; firstName: string; lastName: string; programId?: string }) {
    return apiFetch<{ inviteId: string; inviteToken: string; acceptUrl: string }>(
      '/api/auth/invites',
      { method: 'POST', body: JSON.stringify(input) },
    );
  },

  acceptInvite(token: string) {
    return apiFetch<{ user: { id: string; email: string; role: string; firstName: string | null; lastName: string | null }; accessToken: string; refreshToken: string; inviteId: string; coachUserId: string; isNewUser: boolean }>(
      '/api/auth/invites/accept',
      { method: 'POST', auth: false, body: JSON.stringify({ token }) },
    );
  },

  getMomentumHistory(clientUserId: string, days = 30) {
    return apiFetch<ApiList<{ id: string; score: number; trend: string; performanceScore: number; behaviorScore: number; engagementScore: number; recoveryScore: number; snapshotDate: string }>>(
      `/api/clients/${clientUserId}/momentum?days=${days}`,
    );
  },

  getPlateaus(clientUserId: string) {
    return apiFetch<ApiList<{ exerciseId: string; exerciseName: string; status: string; currentMax: number; previousMax: number; changePercent: number; weeksAtLevel: number }>>(
      `/api/clients/${clientUserId}/plateaus`,
    );
  },

  getOvertraining(clientUserId: string) {
    return apiFetch<{ risk: string; reason: string; sessionsThisWeek: number; avgReadiness: number; avgRPE: number }>(
      `/api/clients/${clientUserId}/overtraining`,
    );
  },

  getChurnRisk(clientUserId: string) {
    return apiFetch<{ level: string; score: number; factors: { factor: string; weight: number; detail: string }[] }>(
      `/api/clients/${clientUserId}/churn-risk`,
    );
  },

  getSmartActions(clientUserId: string) {
    return apiFetch<ApiList<{ id: string; type: string; priority: number; title: string; body: string; actionHref: string; reason: string }>>(
      `/api/clients/${clientUserId}/smart-actions`,
    );
  },

  updateProfile(clientUserId: string, data: { dateOfBirth?: string; gender?: string; heightCm?: number; startingWeight?: number; currentGoal?: string; goalTimeline?: string; currentPhase?: string; communicationStyle?: string; disciplineLevel?: string }) {
    return apiFetch<{ userId: string }>(`/api/clients/${clientUserId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getGoals(clientUserId: string) {
    return apiFetch<ApiList<ClientGoal>>(`/api/clients/${clientUserId}/goals`);
  },

  addGoal(clientUserId: string, data: { goalType: string; title: string; targetValue?: number; targetUnit?: string; targetDate?: string }) {
    return apiFetch<ClientGoal>(`/api/clients/${clientUserId}/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteGoal(clientUserId: string, goalId: string) {
    return apiFetch<{ success: boolean }>(`/api/clients/${clientUserId}/goals/${goalId}`, { method: 'DELETE' });
  },
};
