import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { apiClient } from '@/api/apiClient'
import { AuthLayout } from '@/components/AuthLayout'

type Status = 'loading' | 'success' | 'error'

function Spinner() {
  return (
    <svg
      className="h-8 w-8 animate-spin text-mint"
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

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState<string>(
    'This verification link is invalid or has expired.',
  )

  useEffect(() => {
    if (!token) {
      setErrorMessage('No verification token was provided.')
      setStatus('error')
      return
    }

    apiClient
      .get(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus('success')
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data?.detail as string | undefined
          if (err.response?.status === 410) {
            setErrorMessage(
              detail ?? 'This verification link has expired. Please register again.',
            )
          } else {
            setErrorMessage(
              detail ?? 'This verification link is invalid or has already been used.',
            )
          }
        }
        setStatus('error')
      })
  }, [token])

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center py-4">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <Spinner />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
            <p className="text-sm text-white/50">This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
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
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Email verified!</h1>
            <p className="text-sm text-white/50 mb-8">
              Your email address has been verified. You can now sign in to your account.
            </p>
            <Link
              to="/login"
              className="w-full rounded-xl bg-mint px-4 py-3.5 text-center text-sm font-bold tracking-wide text-ink transition-all duration-200 hover:bg-mint-dark active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
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
            <h1 className="text-2xl font-bold text-white mb-3">Verification failed</h1>
            <p className="text-sm text-white/50 mb-8">{errorMessage}</p>
            <Link
              to="/"
              className="w-full rounded-xl bg-ink-light border border-ink-border px-4 py-3.5 text-center text-sm font-bold tracking-wide text-white/80 transition-all duration-200 hover:bg-ink-border active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-ink-light"
            >
              Return Home
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
