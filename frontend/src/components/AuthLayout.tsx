import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-12">
      {/* Decorative background glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-mint/5 blur-[120px]" />
      </div>

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 animate-fade-in">
        <span className="text-3xl font-black tracking-tight text-white">
          Nutri
        </span>
        <span className="text-3xl font-black tracking-tight text-mint">
          Fit
        </span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="rounded-2xl border border-ink-border bg-ink-light/80 backdrop-blur-xl px-8 py-10 shadow-2xl">
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-white/20 animate-fade-in">
        © {new Date().getFullYear()} NutriFit. All rights reserved.
      </p>
    </div>
  )
}
