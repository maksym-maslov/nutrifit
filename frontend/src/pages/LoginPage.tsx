import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { FormField } from '@/components/FormField'
import type { ProblemDetail } from '@/types/auth'

interface FormState {
  email: string
  password: string
}

interface FieldErrors {
  email?: string
  password?: string
}

function validate(values: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  }
  return errors
}

export function LoginPage() {
  const { login } = useAuth()

  const [values, setValues] = useState<FormState>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isEmailUnverified, setIsEmailUnverified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
      }
      if (serverError) setServerError(null)
      if (isEmailUnverified) setIsEmailUnverified(false)
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
    setIsEmailUnverified(false)

    try {
      await login(values.email, values.password)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const problem = err.response?.data as ProblemDetail | undefined
        if (err.response?.status === 403) {
          setIsEmailUnverified(true)
        } else {
          setServerError(
            problem?.detail ?? 'Invalid email or password. Please try again.',
          )
        }
      } else {
        setServerError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">
          Sign in to your NutriFit account
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

        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange('password')}
          error={fieldErrors.password}
        />

        <div className="-mt-2 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-mint hover:text-mint-dark transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {isEmailUnverified && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
            <p className="font-semibold mb-0.5">Email not verified</p>
            <p className="text-amber-400/80">
              Please check your inbox and click the verification link before signing in.
            </p>
          </div>
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
            'mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
            'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light',
            'disabled:cursor-not-allowed disabled:opacity-60',
          ].join(' ')}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Signing in…
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-mint hover:text-mint-dark transition-colors"
        >
          Create one
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
