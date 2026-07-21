import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '@/api/profileApi'
import {
  createNumberChangeHandler,
  ProfileBiometricsFields,
  validateBiometrics,
  type BiometricsFieldErrors,
} from '@/components/profile/ProfileBiometricsFields'
import {
  ProfileActivityFields,
  ProfileGoalFields,
  validateActivityLevel,
  validateFitnessGoal,
  type PlanFieldErrors,
} from '@/components/profile/ProfilePlanFields'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import type { ProblemDetail } from '@/types/auth'
import {
  detectBrowserTimezone,
  toOnboardingRequest,
  type ActivityLevel,
  type FitnessGoal,
  type Gender,
  type OnboardingFormData,
} from '@/types/profile'

const INITIAL_FORM_DATA: OnboardingFormData = {
  birthday: '',
  gender: null,
  heightCm: '',
  weightKg: '',
  fitnessGoal: null,
  activityLevel: null,
  timezone: detectBrowserTimezone(),
}

export function OnboardingWizard() {
  const { setProfileFromSummary } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)
  const [biometricsErrors, setBiometricsErrors] = useState<BiometricsFieldErrors>({})
  const [goalErrors, setGoalErrors] = useState<Pick<PlanFieldErrors, 'fitnessGoal'>>({})
  const [activityErrors, setActivityErrors] = useState<Pick<PlanFieldErrors, 'activityLevel'>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearBiometricsError = (field: keyof BiometricsFieldErrors) => {
    setBiometricsErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleNumberChange = createNumberChangeHandler(
    setFormData,
    clearBiometricsError,
    () => setServerError(null),
  )

  const handleBirthdayChange = (birthday: string) => {
    setFormData((prev) => ({ ...prev, birthday }))
    clearBiometricsError('birthday')
    if (serverError) setServerError(null)
  }

  const handleGenderSelect = (gender: Gender) => {
    setFormData((prev) => ({ ...prev, gender }))
    clearBiometricsError('gender')
    if (serverError) setServerError(null)
  }

  const handleGoalSelect = (fitnessGoal: FitnessGoal) => {
    setFormData((prev) => ({ ...prev, fitnessGoal }))
    setGoalErrors({})
    if (serverError) setServerError(null)
  }

  const handleActivitySelect = (activityLevel: ActivityLevel) => {
    setFormData((prev) => ({ ...prev, activityLevel }))
    setActivityErrors({})
    if (serverError) setServerError(null)
  }

  const handleNext = () => {
    if (step === 1) {
      const errors = validateBiometrics(formData)
      if (Object.keys(errors).length > 0) {
        setBiometricsErrors(errors)
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      const errors = validateFitnessGoal(formData)
      if (Object.keys(errors).length > 0) {
        setGoalErrors(errors)
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

    const errors = validateActivityLevel(formData)
    if (Object.keys(errors).length > 0) {
      setActivityErrors(errors)
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

          <ProfileBiometricsFields
            formData={formData}
            errors={biometricsErrors}
            onBirthdayChange={handleBirthdayChange}
            onNumberChange={handleNumberChange}
            onGenderSelect={handleGenderSelect}
          />
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

          <ProfileGoalFields
            formData={formData}
            errors={goalErrors}
            onGoalSelect={handleGoalSelect}
          />
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

          <ProfileActivityFields
            formData={formData}
            errors={activityErrors}
            onActivitySelect={handleActivitySelect}
          />

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
