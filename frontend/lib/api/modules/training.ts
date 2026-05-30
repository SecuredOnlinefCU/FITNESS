import { apiFetch } from '@/lib/api/client';

export const trainingApi = {
  createWorkout(input: { title: string; exercises: any[] }) {
    return apiFetch('/api/training/workouts', { method: 'POST', body: JSON.stringify(input) });
  },
  listExercises() {
    return apiFetch<{ items: any[] }>('/api/training/exercises');
  },
};
