import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { resetPassword } from '@/api/authApi'
import { AuthLayout } from '@/components/AuthLayout'
import { FormField } from '@/components/FormField'
import type { ProblemDetail } from '@/types/auth'

interface FormState {
  newPassword: string
  confirmPassword: string
}

interface FieldErrors {
  newPassword?: string
  confirmPassword?: string
}

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.newPassword) {
    errors.newPassword = 'Password is required.'
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [values, setValues] = useState<FormState>({
    newPassword: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExpiredLink, setShowExpiredLink] = useState(false)

  const handleChange =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
      if (serverError) setServerError(null)
      if (showExpiredLink) setShowExpiredLink(false)
    }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!token) {
      setServerError('No reset token was provided.')
      return
    }

    const errors = validate(values)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setServerError(null)
    setShowExpiredLink(false)

    try {
      await resetPassword(token, values.newPassword)
      navigate('/login', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const problem = err.response?.data as ProblemDetail | undefined
        const status = err.response?.status

        if (status === 410) {
          setServerError(
            problem?.detail ?? 'This reset link has expired. Please request a new one.',
          )
          setShowExpiredLink(true)
        } else if (status === 404) {
          setServerError(
            problem?.detail ?? 'This reset link is invalid or has already been used.',
          )
        } else if (status === 400) {
          setServerError(problem?.detail ?? 'Please check your input and try again.')
        } else {
          setServerError(problem?.detail ?? 'Something went wrong. Please try again.')
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
            <svg
              className="h-8 w-8 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Invalid reset link</h1>
          <p className="text-sm text-white/50 mb-8">
            No reset token was provided. Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="w-full rounded-xl bg-mint px-4 py-3.5 text-center text-sm font-bold tracking-wide text-ink transition-all duration-200 hover:bg-mint-dark active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light"
          >
            Request Reset Link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Set a new password</h1>
        <p className="mt-1 text-sm text-white/50">
          Choose a strong password for your NutriFit account
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="newPassword"
          label="New Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.newPassword}
          onChange={handleChange('newPassword')}
          error={fieldErrors.newPassword}
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={fieldErrors.confirmPassword}
        />

        {serverError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
            {showExpiredLink && (
              <p className="mt-2">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-mint hover:text-mint-dark transition-colors"
                >
                  Request a new reset link
                </Link>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            'mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
            'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light',
            'disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Resetting…
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-mint hover:text-mint-dark transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
