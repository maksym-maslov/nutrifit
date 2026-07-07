import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { FormField } from '@/components/FormField'
import type { ProblemDetail } from '@/types/auth'

interface FormState {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface FieldErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  }

  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function RegisterPage() {
  const { register } = useAuth()

  const [values, setValues] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registered, setRegistered] = useState(false)

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
      await register(values.fullName, values.email, values.password)
      setRegistered(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const problem = err.response?.data as ProblemDetail | undefined
        setServerError(
          problem?.detail ?? 'Registration failed. Please try again.',
        )
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (registered) {
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
          <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
          <p className="text-sm text-white/50 mb-2">
            Your account has been created successfully.
          </p>
          <p className="text-sm text-white/50 mb-8">
            We sent a verification link to{' '}
            <span className="font-semibold text-white/80">{values.email}</span>.
            Please verify your email before logging in.
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
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-white/50">
          Start your premium fitness journey today
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="fullName"
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Alex Johnson"
          value={values.fullName}
          onChange={handleChange('fullName')}
          error={fieldErrors.fullName}
        />

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

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={values.password}
          onChange={handleChange('password')}
          error={fieldErrors.password}
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

        {/* Password strength hint */}
        {values.password && !fieldErrors.password && (
          <PasswordStrengthBar password={values.password} />
        )}

        {serverError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            'mt-2 w-full rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
            'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light',
            'disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Creating account…
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
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

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  const bars = [
    strength >= 1 ? 'bg-red-500' : 'bg-ink-border',
    strength >= 2 ? 'bg-yellow-400' : 'bg-ink-border',
    strength >= 3 ? 'bg-cyan-brand' : 'bg-ink-border',
    strength >= 4 ? 'bg-mint' : 'bg-ink-border',
  ]

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {bars.map((color, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${color}`}
          />
        ))}
      </div>
      {strength > 0 && (
        <span className="text-xs text-white/40 w-12 text-right">
          {labels[strength]}
        </span>
      )}
    </div>
  )
}

function getPasswordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password) || /[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
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
