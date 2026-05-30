import { apiFetch } from '@/lib/api/client';
import type { ApiList } from '@/lib/types/domain';

export const tasksApi = {
  listTasks() {
    return apiFetch<ApiList<any>>('/api/tasks');
  },
};
