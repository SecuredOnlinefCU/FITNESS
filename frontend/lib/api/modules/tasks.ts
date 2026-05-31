import { apiFetch } from '@/lib/api/client';

export const tasksApi = {
  listTasks() {
    return apiFetch<{ items: any[] }>('/api/tasks');
  },
  getTask(id: string) {
    return apiFetch<any>(`/api/tasks/${id}`);
  },
  createTask(input: { title: string; description?: string; taskType: string }) {
    return apiFetch<any>('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
  },
  deleteTask(id: string) {
    return apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
  },
  assignTask(taskId: string, data: { clientUserId: string; dueAt?: string; recurrenceRule?: string }) {
    return apiFetch<any>(`/api/tasks/${taskId}/assign`, { method: 'POST', body: JSON.stringify(data) });
  },
  reviewSubmission(submissionId: string, data: { reviewStatus: string; feedbackText?: string }) {
    return apiFetch<any>(`/api/tasks/submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(data) });
  },
};
