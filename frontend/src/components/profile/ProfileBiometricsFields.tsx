import { type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import { FormField } from '@/components/FormField'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import type { Gender, ProfileFormData } from '@/types/profile'
import { birthdayValidationError, maxBirthdayDate, minBirthdayDate } from '@/utils/ageUtils'

export interface BiometricsFieldErrors {
  birthday?: string
  heightCm?: string
  weightKg?: string
  gender?: string
}

interface ProfileBiometricsFieldsProps {
  formData: ProfileFormData
  errors: BiometricsFieldErrors
  onBirthdayChange: (value: string) => void
  onNumberChange: (field: 'heightCm' | 'weightKg') => (e: ChangeEvent<HTMLInputElement>) => void
  onGenderSelect: (gender: Gender) => void
}

function parseNumberInput(value: string): number | '' {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isNaN(parsed) ? '' : parsed
}

export function createNumberChangeHandler(
  setFormData: Dispatch<SetStateAction<ProfileFormData>>,
  clearError: (field: keyof BiometricsFieldErrors) => void,
  clearServerError?: () => void,
) {
  return (field: 'heightCm' | 'weightKg') => (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseNumberInput(e.target.value)
    setFormData((prev) => ({ ...prev, [field]: value }))
    clearError(field)
    clearServerError?.()
  }
}

export function validateBiometrics(formData: ProfileFormData): BiometricsFieldErrors {
  const errors: BiometricsFieldErrors = {}
  const birthdayError = birthdayValidationError(formData.birthday)
  if (birthdayError) {
    errors.birthday = birthdayError
  }

  if (formData.heightCm === '') {
    errors.heightCm = 'Height is required.'
  } else if (formData.heightCm <= 0) {
    errors.heightCm = 'Height must be greater than 0.'
  }

  if (formData.weightKg === '') {
    errors.weightKg = 'Weight is required.'
  } else if (formData.weightKg <= 0) {
    errors.weightKg = 'Weight must be greater than 0.'
  }

  if (!formData.gender) {
    errors.gender = 'Please select your gender.'
  }

  return errors
}

export function ProfileBiometricsFields({
  formData,
  errors,
  onBirthdayChange,
  onNumberChange,
  onGenderSelect,
}: ProfileBiometricsFieldsProps) {
  return (
    <div className="flex flex-col gap-5">
      <FormField
        id="birthday"
        label="Birthday"
        type="date"
        min={minBirthdayDate()}
        max={maxBirthdayDate()}
        value={formData.birthday}
        onChange={(e) => onBirthdayChange(e.target.value)}
        error={errors.birthday}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="heightCm"
          label="Height (cm)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          placeholder="178"
          value={formData.heightCm}
          onChange={onNumberChange('heightCm')}
          error={errors.heightCm}
        />
        <FormField
          id="weightKg"
          label="Weight (kg)"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.1"
          placeholder="75"
          value={formData.weightKg}
          onChange={onNumberChange('weightKg')}
          error={errors.weightKg}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/70">Gender</span>
        <div className="grid grid-cols-2 gap-3">
          <SelectableCard
            title="Male"
            selected={formData.gender === 'MALE'}
            onSelect={() => onGenderSelect('MALE')}
          />
          <SelectableCard
            title="Female"
            selected={formData.gender === 'FEMALE'}
            onSelect={() => onGenderSelect('FEMALE')}
          />
        </div>
        {errors.gender && <p className="text-xs text-red-400">{errors.gender}</p>}
      </div>
    </div>
  )
}
