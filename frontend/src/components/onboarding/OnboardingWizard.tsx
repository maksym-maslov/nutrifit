import { useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '@/api/profileApi'
import { FormField } from '@/components/FormField'
import { SelectableCard } from '@/components/onboarding/SelectableCard'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import type { ProblemDetail } from '@/types/auth'
import {
  toOnboardingRequest,
  type ActivityLevel,
  type FitnessGoal,
  type Gender,
  type OnboardingFormData,
} from '@/types/profile'

const INITIAL_FORM_DATA: OnboardingFormData = {
  age: '',
  gender: null,
  heightCm: '',
  weightKg: '',
  fitnessGoal: null,
  activityLevel: null,
}

interface Step1Errors {
  age?: string
  heightCm?: string
  weightKg?: string
  gender?: string
}

interface Step2Errors {
  fitnessGoal?: string
}

interface Step3Errors {
  activityLevel?: string
}

const FITNESS_GOALS: { value: FitnessGoal; title: string; subtitle: string }[] = [
  { value: 'LOSE_WEIGHT', title: 'Lose Weight', subtitle: 'Caloric deficit for fat loss' },
  { value: 'MAINTAIN', title: 'Maintain', subtitle: 'Stay at your current weight' },
  { value: 'GAIN_MUSCLE', title: 'Gain Muscle', subtitle: 'Surplus to build lean mass' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; title: string; subtitle: string }[] = [
  { value: 'SEDENTARY', title: 'Sedentary', subtitle: 'Desk job, little or no exercise' },
  { value: 'LIGHTLY_ACTIVE', title: 'Lightly Active', subtitle: 'Light exercise 1–3 days/week' },
  {
    value: 'MODERATELY_ACTIVE',
    title: 'Moderately Active',
    subtitle: 'Moderate exercise 3–5 days/week',
  },
  { value: 'VERY_ACTIVE', title: 'Very Active', subtitle: 'Hard exercise 6–7 days/week' },
]

function validateStep1(formData: OnboardingFormData): Step1Errors {
  const errors: Step1Errors = {}

  if (formData.age === '') {
    errors.age = 'Age is required.'
  } else if (formData.age < 1 || formData.age > 120) {
    errors.age = 'Age must be between 1 and 120.'
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

function validateStep2(formData: OnboardingFormData): Step2Errors {
  const errors: Step2Errors = {}
  if (!formData.fitnessGoal) {
    errors.fitnessGoal = 'Please select your fitness goal.'
  }
  return errors
}

function validateStep3(formData: OnboardingFormData): Step3Errors {
  const errors: Step3Errors = {}
  if (!formData.activityLevel) {
    errors.activityLevel = 'Please select your activity level.'
  }
  return errors
}

function parseNumberInput(value: string): number | '' {
  if (value === '') return ''
  const parsed = Number(value)
  return Number.isNaN(parsed) ? '' : parsed
}

export function OnboardingWizard() {
  const { setProfileFromSummary } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({})
  const [step2Errors, setStep2Errors] = useState<Step2Errors>({})
  const [step3Errors, setStep3Errors] = useState<Step3Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNumberChange =
    (field: 'age' | 'heightCm' | 'weightKg') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = parseNumberInput(e.target.value)
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (step1Errors[field]) {
        setStep1Errors((prev) => ({ ...prev, [field]: undefined }))
      }
      if (serverError) setServerError(null)
    }

  const handleGenderSelect = (gender: Gender) => {
    setFormData((prev) => ({ ...prev, gender }))
    if (step1Errors.gender) {
      setStep1Errors((prev) => ({ ...prev, gender: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleGoalSelect = (fitnessGoal: FitnessGoal) => {
    setFormData((prev) => ({ ...prev, fitnessGoal }))
    if (step2Errors.fitnessGoal) {
      setStep2Errors((prev) => ({ ...prev, fitnessGoal: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleActivitySelect = (activityLevel: ActivityLevel) => {
    setFormData((prev) => ({ ...prev, activityLevel }))
    if (step3Errors.activityLevel) {
      setStep3Errors((prev) => ({ ...prev, activityLevel: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleNext = () => {
    if (step === 1) {
      const errors = validateStep1(formData)
      if (Object.keys(errors).length > 0) {
        setStep1Errors(errors)
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const errors = validateStep2(formData)
      if (Object.keys(errors).length > 0) {
        setStep2Errors(errors)
        return
      }
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step === 2) setStep(1)
    if (step === 3) setStep(2)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errors = validateStep3(formData)
    if (Object.keys(errors).length > 0) {
      setStep3Errors(errors)
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      const request = toOnboardingRequest(formData)
      const profile = await completeOnboarding(request)
      setProfileFromSummary(profile)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const problem = err.response?.data as ProblemDetail | undefined
        setServerError(
          problem?.detail ?? 'Failed to complete onboarding. Please try again.',
        )
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercent = (step / 3) * 100

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>Step {step} of 3</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-border">
          <div
            className="h-full rounded-full bg-mint transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Your biometrics</h1>
            <p className="mt-1 text-sm text-white/50">
              Tell us about yourself so we can personalize your plan
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <FormField
              id="age"
              label="Age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder="28"
              value={formData.age}
              onChange={handleNumberChange('age')}
              error={step1Errors.age}
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
                onChange={handleNumberChange('heightCm')}
                error={step1Errors.heightCm}
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
                onChange={handleNumberChange('weightKg')}
                error={step1Errors.weightKg}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-white/70">Gender</span>
              <div className="grid grid-cols-2 gap-3">
                <SelectableCard
                  title="Male"
                  selected={formData.gender === 'MALE'}
                  onSelect={() => handleGenderSelect('MALE')}
                />
                <SelectableCard
                  title="Female"
                  selected={formData.gender === 'FEMALE'}
                  onSelect={() => handleGenderSelect('FEMALE')}
                />
              </div>
              {step1Errors.gender && (
                <p className="text-xs text-red-400">{step1Errors.gender}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Your goal</h1>
            <p className="mt-1 text-sm text-white/50">
              What do you want to achieve with NutriFit?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FITNESS_GOALS.map((goal) => (
              <SelectableCard
                key={goal.value}
                title={goal.title}
                subtitle={goal.subtitle}
                selected={formData.fitnessGoal === goal.value}
                onSelect={() => handleGoalSelect(goal.value)}
              />
            ))}
            {step2Errors.fitnessGoal && (
              <p className="text-xs text-red-400">{step2Errors.fitnessGoal}</p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Activity level</h1>
            <p className="mt-1 text-sm text-white/50">
              How active are you on a typical week?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {ACTIVITY_LEVELS.map((level) => (
              <SelectableCard
                key={level.value}
                title={level.title}
                subtitle={level.subtitle}
                selected={formData.activityLevel === level.value}
                onSelect={() => handleActivitySelect(level.value)}
              />
            ))}
            {step3Errors.activityLevel && (
              <p className="text-xs text-red-400">{step3Errors.activityLevel}</p>
            )}
          </div>

          {serverError && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className={[
                'flex-1 rounded-xl border border-ink-border px-4 py-3.5 text-sm font-semibold text-white/70',
                'transition-all duration-200 hover:border-mint/40 hover:text-white',
                'disabled:cursor-not-allowed disabled:opacity-60',
              ].join(' ')}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={[
                'flex-[2] rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
                'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light',
                'disabled:cursor-not-allowed disabled:opacity-60',
              ].join(' ')}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Calculating…
                </span>
              ) : (
                'Calculate My Plan'
              )}
            </button>
          </div>
        </form>
      )}

      {step < 3 && (
        <>
          {serverError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className={[
                  'flex-1 rounded-xl border border-ink-border px-4 py-3.5 text-sm font-semibold text-white/70',
                  'transition-all duration-200 hover:border-mint/40 hover:text-white',
                ].join(' ')}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className={[
                'rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
                'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light',
                step > 1 ? 'flex-[2]' : 'w-full',
              ].join(' ')}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
