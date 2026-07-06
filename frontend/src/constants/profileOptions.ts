import type { ActivityLevel, FitnessGoal } from '@/types/profile'

export const FITNESS_GOALS: { value: FitnessGoal; title: string; subtitle: string }[] = [
  { value: 'LOSE_WEIGHT', title: 'Lose Weight', subtitle: 'Caloric deficit for fat loss' },
  { value: 'MAINTAIN', title: 'Maintain', subtitle: 'Stay at your current weight' },
  { value: 'GAIN_MUSCLE', title: 'Gain Muscle', subtitle: 'Surplus to build lean mass' },
]

export const ACTIVITY_LEVELS: { value: ActivityLevel; title: string; subtitle: string }[] = [
  { value: 'SEDENTARY', title: 'Sedentary', subtitle: 'Desk job, little or no exercise' },
  { value: 'LIGHTLY_ACTIVE', title: 'Lightly Active', subtitle: 'Light exercise 1–3 days/week' },
  {
    value: 'MODERATELY_ACTIVE',
    title: 'Moderately Active',
    subtitle: 'Moderate exercise 3–5 days/week',
  },
  { value: 'VERY_ACTIVE', title: 'Very Active', subtitle: 'Hard exercise 6–7 days/week' },
]
