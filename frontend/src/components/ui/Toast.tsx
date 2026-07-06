import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDismiss: () => void
  durationMs?: number
}

export function Toast({ message, onDismiss, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!message) return

    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [message, onDismiss, durationMs])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-50 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-white/10 bg-ink-light px-4 py-2.5 text-sm text-white/80 shadow-lg animate-slide-up"
    >
      {message}
    </div>
  )
}
