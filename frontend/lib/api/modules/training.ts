import { apiFetch } from '@/lib/api/client';
import type { ApiList, Exercise, SetLog, Workout, WorkoutAssignment, WorkoutSession, WorkoutExercise } from '@/lib/types/domain';

export const trainingApi = {
  listWorkouts() {
    return apiFetch<ApiList<Workout>>('/api/training/workouts');
  },
  getWorkout(id: string) {
    return apiFetch<(Workout & { exercises?: WorkoutExercise[] }) | null>(`/api/training/workouts/${id}`);
  },
  createWorkout(input: { title: string; description?: string; programId?: string; exercises?: unknown[] }) {
    return apiFetch<Workout>(`/api/training/workouts`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateWorkout(id: string, input: { title: string; description?: string; programId?: string; exercises?: unknown[] }) {
    return apiFetch<Workout>(`/api/training/workouts/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteWorkout(id: string) {
    return apiFetch<void>(`/api/training/workouts/${id}`, { method: 'DELETE' });
  },
  listExercises() {
    return apiFetch<ApiList<Exercise>>('/api/training/exercises');
  },
  createExercise(input: { name: string; instructions?: string; muscleGroups?: string; equipment?: string }) {
    return apiFetch<Exercise>('/api/training/exercises', { method: 'POST', body: JSON.stringify(input) });
  },
  listAssignments() {
    return apiFetch<ApiList<WorkoutAssignment>>('/api/training/assignments');
  },
  assignWorkout(data: { workoutId: string; clientUserId: string; assignedForDate?: string }) {
    return apiFetch<WorkoutAssignment>('/api/training/assignments', { method: 'POST', body: JSON.stringify(data) });
  },
  listPrograms() {
    return apiFetch<ApiList<unknown>>('/api/training/programs');
  },
  listCoachClients() {
    return apiFetch<{ items: { id: string; name: string; email: string }[] }>('/api/training/coach-clients');
  },
  listClientAssignments() {
    return apiFetch<ApiList<WorkoutAssignment>>('/api/training/client-assignments');
  },
  startSession(assignmentId: string) {
    return apiFetch<WorkoutSession>(`/api/training/assignments/${assignmentId}/start`, { method: 'POST' });
  },
  getSession(sessionId: string) {
    return apiFetch<WorkoutSession | null>(`/api/training/sessions/${sessionId}`);
  },
  logSet(sessionId: string, data: { workoutExerciseId: string; setNumber: number; reps?: number; weight?: number; rpe?: number; notes?: string }) {
    return apiFetch<SetLog>(`/api/training/sessions/${sessionId}/sets`, { method: 'POST', body: JSON.stringify(data) });
  },
  completeSession(sessionId: string) {
    return apiFetch<WorkoutSession>(`/api/training/sessions/${sessionId}/complete`, { method: 'POST' });
  },
  getHistory() {
    return apiFetch<ApiList<WorkoutSession>>('/api/training/history');
  },
};
