import { apiFetch } from '@/lib/api/client';

export const trainingApi = {
  listWorkouts() {
    return apiFetch<{ items: any[] }>('/api/training/workouts');
  },
  getWorkout(id: string) {
    return apiFetch<any>(`/api/training/workouts/${id}`);
  },
  createWorkout(input: { title: string; description?: string; programId?: string; exercises?: any[] }) {
    return apiFetch<any>('/api/training/workouts', { method: 'POST', body: JSON.stringify(input) });
  },
  updateWorkout(id: string, input: { title: string; description?: string; programId?: string; exercises?: any[] }) {
    return apiFetch<any>(`/api/training/workouts/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteWorkout(id: string) {
    return apiFetch(`/api/training/workouts/${id}`, { method: 'DELETE' });
  },
  listExercises() {
    return apiFetch<{ items: any[] }>('/api/training/exercises');
  },
  createExercise(input: { name: string; instructions?: string; muscleGroups?: string; equipment?: string }) {
    return apiFetch<any>('/api/training/exercises', { method: 'POST', body: JSON.stringify(input) });
  },
  listAssignments() {
    return apiFetch<{ items: any[] }>('/api/training/assignments');
  },
  assignWorkout(data: { workoutId: string; clientUserId: string; assignedForDate?: string }) {
    return apiFetch<any>('/api/training/assignments', { method: 'POST', body: JSON.stringify(data) });
  },
  listPrograms() {
    return apiFetch<{ items: any[] }>('/api/training/programs');
  },
  listCoachClients() {
    return apiFetch<{ items: string[] }>('/api/training/coach-clients');
  },
  listClientAssignments() {
    return apiFetch<{ items: any[] }>('/api/training/client-assignments');
  },
  startSession(assignmentId: string) {
    return apiFetch<any>(`/api/training/assignments/${assignmentId}/start`, { method: 'POST' });
  },
  getSession(sessionId: string) {
    return apiFetch<any>(`/api/training/sessions/${sessionId}`);
  },
  logSet(sessionId: string, data: { workoutExerciseId: string; setNumber: number; reps?: number; weight?: number; rpe?: number; notes?: string }) {
    return apiFetch<any>(`/api/training/sessions/${sessionId}/sets`, { method: 'POST', body: JSON.stringify(data) });
  },
  completeSession(sessionId: string) {
    return apiFetch<any>(`/api/training/sessions/${sessionId}/complete`, { method: 'POST' });
  },
  getHistory() {
    return apiFetch<{ items: any[] }>('/api/training/history');
  },
};
