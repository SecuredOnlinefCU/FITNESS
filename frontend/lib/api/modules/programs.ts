import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

type ProgramNested = { id: string; coachUserId: string; name: string; description?: string | null };
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
};
