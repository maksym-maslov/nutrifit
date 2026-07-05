import { addDays, formatDisplayDate, startOfToday, toApiDate } from '@/utils/dateUtils'

interface DateNavigatorProps {
  date: Date
  onPrevious: () => void
  onNext: () => void
}

export function DateNavigator({ date, onPrevious, onNext }: DateNavigatorProps) {
  const canGoForward =
    toApiDate(addDays(date, 1)) <= toApiDate(startOfToday())

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevious}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-border bg-ink-light text-white/70 hover:border-mint/40 hover:text-white transition-all active:scale-95"
        aria-label="Previous day"
      >
        <ChevronLeftIcon />
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold text-white">{formatDisplayDate(date)}</p>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-border bg-ink-light text-white/70 hover:border-mint/40 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-ink-border disabled:hover:text-white/70"
        aria-label="Next day"
      >
        <ChevronRightIcon />
      </button>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
