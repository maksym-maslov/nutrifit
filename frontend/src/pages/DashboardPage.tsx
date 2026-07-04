import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl font-black tracking-tight">Nutri</span>
          <span className="text-2xl font-black tracking-tight text-mint">Fit</span>
        </div>
        <h1 className="text-4xl font-bold mt-4">
          Welcome back, <span className="text-mint">{user?.email}</span>
        </h1>
        <p className="mt-2 text-white/50 text-sm">
          Dashboard coming soon. Your session is active.
        </p>
      </div>

      <div className="rounded-xl border border-ink-border bg-ink-light px-6 py-4 text-sm text-white/60">
        <p>Role: <span className="text-white font-medium">{user?.role}</span></p>
      </div>

      <button
        onClick={logout}
        className="rounded-xl border border-ink-border px-6 py-2.5 text-sm font-semibold text-white/60 hover:border-mint/40 hover:text-white transition-all"
      >
        Sign Out
      </button>
    </div>
  )
}
