import { apiFetch } from '@/lib/api/client';
import type { ApiList, ProgramWeek } from '@/lib/types/domain';

type ProgramNested = { id: string; coachUserId: string; name: string; description?: string | null; weeks?: ProgramWeek[] };
type ClientBrief = { id: string; name?: string; email?: string };
type MembershipBrief = { id: string; clientUserId: string; status?: string; clientUser?: ClientBrief };
type ProgramGuidelines = { contentMd?: string };

export type ProgramListItem = {
  id: string;
  name: string;
  description?: string | null;
  coachUserId?: string;
  programId?: string;
  clientUserId?: string;
  status?: string;
  program?: ProgramNested;
  memberships?: MembershipBrief[];
  guidelines?: ProgramGuidelines | null;
  weeks?: ProgramWeek[];
};

export const programsApi = {
  createProgram(input: { name: string; description?: string }) {
    return apiFetch<ProgramListItem>('/api/programs', { method: 'POST', body: JSON.stringify(input) });
  },
  listPrograms() {
    return apiFetch<ApiList<ProgramListItem>>('/api/programs');
  },
  getProgram(id: string) {
    return apiFetch<ProgramListItem | null>(`/api/programs/${id}`);
  },
  updateProgram(id: string, input: { name: string; description?: string }) {
    return apiFetch<ProgramListItem>(`/api/programs/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteProgram(id: string) {
    return apiFetch<void>(`/api/programs/${id}`, { method: 'DELETE' });
  },
  listWeeks(programId: string) {
    return apiFetch<ApiList<ProgramWeek>>(`/api/programs/${programId}/weeks`);
  },
  createWeek(programId: string, input: { weekIndex: number; phaseLabel?: string; focus?: string }) {
    return apiFetch<ProgramWeek>(`/api/programs/${programId}/weeks`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateWeek(programId: string, weekId: string, input: { phaseLabel?: string; focus?: string }) {
    return apiFetch<ProgramWeek>(`/api/programs/${programId}/weeks/${weekId}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  deleteWeek(programId: string, weekId: string) {
    return apiFetch<void>(`/api/programs/${programId}/weeks/${weekId}`, { method: 'DELETE' });
  },
};
