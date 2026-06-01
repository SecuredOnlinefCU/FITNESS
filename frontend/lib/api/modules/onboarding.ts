import { apiFetch } from '@/lib/api/client';
import type { OnboardingBlueprintResult } from '@/lib/types/domain';

export type { OnboardingBlueprintResult } from '@/lib/types/domain';

export type OnboardingInput = {
  goal: string;
  level: string;
  equipment: string;
  daysPerWeek: number;
  limitations: string[];
};

export type BlueprintInput = {
  goal: string;
  level: string;
  equipment: string;
  daysPerWeek: number;
  sessionLength: number;
  limitations: string[];
  sleepHours?: number;
  stressLevel?: number;
  activityLevel?: string;
  pushups?: number;
  plankSeconds?: number;
  squats?: number;
};

export type GeneratedPlan = {
  program: {
    id: string;
    name: string;
    description: string;
    weeks: {
      id: string;
      weekIndex: number;
      phaseLabel: string;
      workouts: {
        id: string;
        title: string;
        description: string;
        exercises: { id: string }[];
      }[];
    }[];
  };
  summary: {
    goal: string;
    level: string;
    equipment: string;
    daysPerWeek: number;
    totalWorkouts: number;
    phase: string;
  };
};

export const onboardingApi = {
  generatePlan(input: OnboardingInput) {
    return apiFetch<GeneratedPlan>('/api/onboarding/generate-plan', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  generateBlueprint(input: BlueprintInput) {
    return apiFetch<OnboardingBlueprintResult>('/api/onboarding/blueprint', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
