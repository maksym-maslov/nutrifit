export type FitnessGoal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'

export type Gender = 'MALE' | 'FEMALE'

export interface OnboardingFormData {
  age: number | ''
  gender: Gender | null
  heightCm: number | ''
  weightKg: number | ''
  fitnessGoal: FitnessGoal | null
  activityLevel: ActivityLevel | null
}

export interface OnboardingRequest {
  age: number
  gender: Gender
  heightCm: number
  weightKg: number
  fitnessGoal: FitnessGoal
  activityLevel: ActivityLevel
}

export interface UserProfileSummary {
  fullName: string | null
  email: string | null
  weightKg: number | null
  goalCalories: number | null
  goalProteinG: number | null
  goalCarbsG: number | null
  goalFatG: number | null
  onboarded: boolean
}

export interface UserProfileSummaryDto {
  fullName: string | null
  email: string | null
  weightKg: number | null
  goalCalories: number | null
  goalProteinG: number | null
  goalCarbsG: number | null
  goalFatG: number | null
  onboarded: boolean
}

export interface OnboardingApiPayload {
  age: number
  gender: string
  heightCm: number
  weightKg: number
  fitnessGoal: FitnessGoal
  activityLevel: ActivityLevel
}

export function mapProfileSummaryDto(dto: UserProfileSummaryDto): UserProfileSummary {
  return {
    fullName: dto.fullName,
    email: dto.email,
    weightKg: dto.weightKg,
    goalCalories: dto.goalCalories,
    goalProteinG: dto.goalProteinG,
    goalCarbsG: dto.goalCarbsG,
    goalFatG: dto.goalFatG,
    onboarded: dto.onboarded,
  }
}

export function toOnboardingApiPayload(request: OnboardingRequest): OnboardingApiPayload {
  return {
    age: request.age,
    gender: request.gender.toLowerCase(),
    heightCm: request.heightCm,
    weightKg: request.weightKg,
    fitnessGoal: request.fitnessGoal,
    activityLevel: request.activityLevel,
  }
}

export function toOnboardingRequest(formData: OnboardingFormData): OnboardingRequest {
  if (
    formData.age === '' ||
    formData.gender === null ||
    formData.heightCm === '' ||
    formData.weightKg === '' ||
    formData.fitnessGoal === null ||
    formData.activityLevel === null
  ) {
    throw new Error('All onboarding fields are required.')
  }

  return {
    age: formData.age,
    gender: formData.gender,
    heightCm: formData.heightCm,
    weightKg: formData.weightKg,
    fitnessGoal: formData.fitnessGoal,
    activityLevel: formData.activityLevel,
  }
}
