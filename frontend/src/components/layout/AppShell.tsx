import { type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-40 border-b border-ink-border bg-ink/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight">Nutri</span>
            <span className="text-lg font-black tracking-tight text-mint">Fit</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 pb-24 pt-6">{children}</main>
    </div>
  )
}
