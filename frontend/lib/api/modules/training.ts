import { apiFetch } from '@/lib/api/client';
import type { ApiList, Exercise, SetLog, Workout, WorkoutAssignment, WorkoutSession, WorkoutExercise } from '@/lib/types/domain';

export const trainingApi = {
  listWorkouts() {
    return apiFetch<ApiList<Workout>>('/api/training/workouts');
  },
  getWorkout(id: string) {
    return apiFetch<(Workout & { exercises?: WorkoutExercise[] }) | null>(`/api/training/workouts/${id}`);
  },
  createWorkout(input: { title: string; description?: string; programId?: string; weekId?: string; dayIndex?: number; exercises?: unknown[] }) {
    return apiFetch<Workout>(`/api/training/workouts`, { method: 'POST', body: JSON.stringify(input) });
  },
  updateWorkout(id: string, input: { title: string; description?: string; programId?: string; weekId?: string; dayIndex?: number; exercises?: unknown[] }) {
    return apiFetch<Workout>(`/api/training/workouts/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteWorkout(id: string) {
    return apiFetch<void>(`/api/training/workouts/${id}`, { method: 'DELETE' });
  },
  listExercises() {
    return apiFetch<ApiList<Exercise>>('/api/training/exercises');
  },
  createExercise(input: { name: string; instructions?: string; demoVideoUrl?: string; coachCues?: string; muscleGroups?: string; equipment?: string }) {
    return apiFetch<Exercise>('/api/training/exercises', { method: 'POST', body: JSON.stringify(input) });
  },
  updateExercise(id: string, input: { name?: string; instructions?: string; demoVideoUrl?: string; coachCues?: string; muscleGroups?: string; equipment?: string }) {
    return apiFetch<Exercise>(`/api/training/exercises/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  getEstimatedMaxes() {
    return apiFetch<{ estimates: { bestE1rm: number; exerciseName: string }[] }>('/api/training/estimated-max');
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
    return apiFetch<{ items: { id: string; firstName: string; lastName: string; email: string }[] }>('/api/training/coach-clients');
  },
  getCalendarAssignments(from: string, to: string, clientUserId?: string) {
    const params = new URLSearchParams({ from, to });
    if (clientUserId) params.set('clientUserId', clientUserId);
    return apiFetch<ApiList<WorkoutAssignment>>(`/api/training/assignments/calendar?${params}`);
  },
  updateAssignment(id: string, data: { assignedForDate?: string; status?: string }) {
    return apiFetch<WorkoutAssignment>(`/api/training/assignments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteAssignment(id: string) {
    return apiFetch<void>(`/api/training/assignments/${id}`, { method: 'DELETE' });
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
  logSet(sessionId: string, data: { workoutExerciseId: string; setNumber: number; reps?: number; weight?: number; rpe?: number; setType?: string; notes?: string }) {
    return apiFetch<SetLog>(`/api/training/sessions/${sessionId}/sets`, { method: 'POST', body: JSON.stringify(data) });
  },
  completeSession(sessionId: string) {
    return apiFetch<WorkoutSession>(`/api/training/sessions/${sessionId}/complete`, { method: 'POST' });
  },
  getHistory() {
    return apiFetch<ApiList<WorkoutSession>>('/api/training/history');
  },
  listSessionsForCoach(clientUserId: string) {
    return apiFetch<ApiList<WorkoutSession>>(`/api/training/sessions/coach?clientUserId=${encodeURIComponent(clientUserId)}`);
  },
  updateSessionReview(sessionId: string, coachReview: string) {
    return apiFetch<WorkoutSession>(`/api/training/sessions/${sessionId}/review`, { method: 'PATCH', body: JSON.stringify({ coachReview }) });
  },
};
