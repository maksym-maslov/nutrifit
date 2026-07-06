export type FitnessGoal = 'LOSE_WEIGHT' | 'MAINTAIN' | 'GAIN_MUSCLE'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'

export type Gender = 'MALE' | 'FEMALE'

export interface ProfileFormData {
  birthday: string
  gender: Gender | null
  heightCm: number | ''
  weightKg: number | ''
  fitnessGoal: FitnessGoal | null
  activityLevel: ActivityLevel | null
}

export type OnboardingFormData = ProfileFormData

export interface ProfileRequest {
  birthday: string
  gender: Gender
  heightCm: number
  weightKg: number
  fitnessGoal: FitnessGoal
  activityLevel: ActivityLevel
}

export type OnboardingRequest = ProfileRequest

export interface UserProfileSummary {
  fullName: string | null
  email: string | null
  birthday: string | null
  gender: Gender | null
  heightCm: number | null
  weightKg: number | null
  fitnessGoal: FitnessGoal | null
  activityLevel: ActivityLevel | null
  goalCalories: number | null
  goalProteinG: number | null
  goalCarbsG: number | null
  goalFatG: number | null
  onboarded: boolean
}

export interface UserProfileSummaryDto {
  fullName: string | null
  email: string | null
  birthday: string | null
  gender: string | null
  heightCm: number | null
  weightKg: number | null
  fitnessGoal: FitnessGoal | null
  activityLevel: ActivityLevel | null
  goalCalories: number | null
  goalProteinG: number | null
  goalCarbsG: number | null
  goalFatG: number | null
  onboarded: boolean
}

export interface ProfileApiPayload {
  birthday: string
  gender: string
  heightCm: number
  weightKg: number
  fitnessGoal: FitnessGoal
  activityLevel: ActivityLevel
}

export interface UpdateAccountRequest {
  fullName: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

function parseGender(value: string | null): Gender | null {
  if (!value) return null
  const normalized = value.toUpperCase()
  if (normalized === 'MALE' || normalized === 'FEMALE') {
    return normalized
  }
  return null
}

export function mapProfileSummaryDto(dto: UserProfileSummaryDto): UserProfileSummary {
  return {
    fullName: dto.fullName,
    email: dto.email,
    birthday: dto.birthday,
    gender: parseGender(dto.gender),
    heightCm: dto.heightCm,
    weightKg: dto.weightKg,
    fitnessGoal: dto.fitnessGoal,
    activityLevel: dto.activityLevel,
    goalCalories: dto.goalCalories,
    goalProteinG: dto.goalProteinG,
    goalCarbsG: dto.goalCarbsG,
    goalFatG: dto.goalFatG,
    onboarded: dto.onboarded,
  }
}

export function toProfileApiPayload(request: ProfileRequest): ProfileApiPayload {
  return {
    birthday: request.birthday,
    gender: request.gender.toLowerCase(),
    heightCm: request.heightCm,
    weightKg: request.weightKg,
    fitnessGoal: request.fitnessGoal,
    activityLevel: request.activityLevel,
  }
}

export function toProfileRequest(formData: ProfileFormData): ProfileRequest {
  if (
    !formData.birthday ||
    formData.gender === null ||
    formData.heightCm === '' ||
    formData.weightKg === '' ||
    formData.fitnessGoal === null ||
    formData.activityLevel === null
  ) {
    throw new Error('All profile fields are required.')
  }

  return {
    birthday: formData.birthday,
    gender: formData.gender,
    heightCm: formData.heightCm,
    weightKg: formData.weightKg,
    fitnessGoal: formData.fitnessGoal,
    activityLevel: formData.activityLevel,
  }
}

export function toOnboardingRequest(formData: OnboardingFormData): OnboardingRequest {
  return toProfileRequest(formData)
}

export function profileSummaryToFormData(profile: UserProfileSummary): ProfileFormData {
  return {
    birthday: profile.birthday ?? '',
    gender: profile.gender,
    heightCm: profile.heightCm ?? '',
    weightKg: profile.weightKg ?? '',
    fitnessGoal: profile.fitnessGoal,
    activityLevel: profile.activityLevel,
  }
}

// Backward-compatible aliases
export const toOnboardingApiPayload = toProfileApiPayload
