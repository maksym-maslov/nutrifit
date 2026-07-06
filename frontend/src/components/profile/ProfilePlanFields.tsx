import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { ACTIVITY_LEVELS, FITNESS_GOALS } from '@/constants/profileOptions'
import type { ActivityLevel, FitnessGoal, ProfileFormData } from '@/types/profile'

export interface PlanFieldErrors {
  fitnessGoal?: string
  activityLevel?: string
}

interface ProfileGoalFieldsProps {
  formData: ProfileFormData
  errors: Pick<PlanFieldErrors, 'fitnessGoal'>
  onGoalSelect: (fitnessGoal: FitnessGoal) => void
}

interface ProfileActivityFieldsProps {
  formData: ProfileFormData
  errors: Pick<PlanFieldErrors, 'activityLevel'>
  onActivitySelect: (activityLevel: ActivityLevel) => void
}

export function validateFitnessGoal(formData: ProfileFormData): Pick<PlanFieldErrors, 'fitnessGoal'> {
  const errors: Pick<PlanFieldErrors, 'fitnessGoal'> = {}
  if (!formData.fitnessGoal) {
    errors.fitnessGoal = 'Please select your fitness goal.'
  }
  return errors
}

export function validateActivityLevel(
  formData: ProfileFormData,
): Pick<PlanFieldErrors, 'activityLevel'> {
  const errors: Pick<PlanFieldErrors, 'activityLevel'> = {}
  if (!formData.activityLevel) {
    errors.activityLevel = 'Please select your activity level.'
  }
  return errors
}

export function ProfileGoalFields({ formData, errors, onGoalSelect }: ProfileGoalFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      {FITNESS_GOALS.map((goal) => (
        <SelectableCard
          key={goal.value}
          title={goal.title}
          subtitle={goal.subtitle}
          selected={formData.fitnessGoal === goal.value}
          onSelect={() => onGoalSelect(goal.value)}
        />
      ))}
      {errors.fitnessGoal && <p className="text-xs text-red-400">{errors.fitnessGoal}</p>}
    </div>
  )
}

export function ProfileActivityFields({
  formData,
  errors,
  onActivitySelect,
}: ProfileActivityFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      {ACTIVITY_LEVELS.map((level) => (
        <SelectableCard
          key={level.value}
          title={level.title}
          subtitle={level.subtitle}
          selected={formData.activityLevel === level.value}
          onSelect={() => onActivitySelect(level.value)}
        />
      ))}
      {errors.activityLevel && <p className="text-xs text-red-400">{errors.activityLevel}</p>}
    </div>
  )
}
