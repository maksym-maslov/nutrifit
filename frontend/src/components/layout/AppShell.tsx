import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { logout } = useAuth()
  const location = useLocation()
  const isProfile = location.pathname === '/profile'

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-40 border-b border-ink-border bg-ink/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight">Nutri</span>
            <span className="text-lg font-black tracking-tight text-mint">Fit</span>
          </div>
          <div className="flex items-center gap-4">
            {!isProfile && (
              <Link
                to="/profile"
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Profile
              </Link>
            )}
            {isProfile && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 pb-24 pt-6">{children}</main>
    </div>
  )
}
