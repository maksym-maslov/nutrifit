import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { requestPasswordReset } from '@/api/authApi'
import { AuthLayout } from '@/components/AuthLayout'
import { FormField } from '@/components/FormField'
import type { ProblemDetail } from '@/types/auth'

interface FormState {
  email: string
}

interface FieldErrors {
  email?: string
}

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}

export function ForgotPasswordPage() {
  const [values, setValues] = useState<FormState>({ email: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
      if (serverError) setServerError(null)
    }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors = validate(values)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      await requestPasswordReset(values.email)
      setSubmitted(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const problem = err.response?.data as ProblemDetail | undefined
        setServerError(
          problem?.detail ?? 'Something went wrong. Please try again.',
        )
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint/10 mb-6">
            <svg
              className="h-8 w-8 text-mint"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
          <p className="text-sm text-white/50 mb-8">
            If that email exists, a reset link was sent. The link expires in 15 minutes.
          </p>
          <Link
            to="/login"
            className="w-full rounded-xl bg-mint px-4 py-3.5 text-center text-sm font-bold tracking-wide text-ink transition-all duration-200 hover:bg-mint-dark active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
        <p className="mt-1 text-sm text-white/50">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange('email')}
          error={fieldErrors.email}
        />

        {serverError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
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
              Sending…
            </span>
          ) : (
            'Send Reset Link'
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
