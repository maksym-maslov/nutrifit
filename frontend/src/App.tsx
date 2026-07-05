import { type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { OnboardingPage } from '@/pages/OnboardingPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <AppLoadingScreen />
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isOnboarded, isLoading } = useAuth()

  if (isLoading) {
    return <AppLoadingScreen />
  }

  if (user) {
    return <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />
  }

  return <>{children}</>
}

function OnboardedRoute({ children }: { children: ReactNode }) {
  const { isOnboarded, isLoading } = useAuth()

  if (isLoading) {
    return <AppLoadingScreen />
  }

  return isOnboarded ? <>{children}</> : <Navigate to="/onboarding" replace />
}

function OnboardingRoute({ children }: { children: ReactNode }) {
  const { isOnboarded, isLoading } = useAuth()

  if (isLoading) {
    return <AppLoadingScreen />
  }

  return isOnboarded ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingRoute>
              <OnboardingPage />
            </OnboardingRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <OnboardedRoute>
              <DashboardPage />
            </OnboardedRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-white">Nutri</span>
        <span className="text-2xl font-black tracking-tight text-mint">Fit</span>
      </div>
    </div>
  )
}
