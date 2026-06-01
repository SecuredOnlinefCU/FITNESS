import { apiFetch } from '@/lib/api/client';
import type { ApiList, Task, TaskAssignment, TaskSubmission } from '@/lib/types/domain';

export const tasksApi = {
  listTasks() {
    return apiFetch<ApiList<Task | TaskAssignment>>('/api/tasks');
  },
  getTask(id: string) {
    return apiFetch<Task>(`/api/tasks/${id}`);
  },
  createTask(input: { title: string; description?: string; taskType: string }) {
    return apiFetch<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
  },
  deleteTask(id: string) {
    return apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE' });
  },
  assignTask(taskId: string, data: { clientUserId: string; dueAt?: string; recurrenceRule?: string }) {
    return apiFetch<TaskAssignment>(`/api/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify(data) });
  },
  submitTask(assignmentId: string, data: { bodyText?: string; mediaAssetId?: string }) {
    return apiFetch<TaskSubmission>(`/api/tasks/assignments/${assignmentId}/submissions`, { method: 'POST', body: JSON.stringify(data) });
  },
  reviewSubmission(submissionId: string, data: { reviewStatus: string; feedbackText?: string }) {
    return apiFetch<TaskSubmission>(`/api/tasks/submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(data) });
  },
};
