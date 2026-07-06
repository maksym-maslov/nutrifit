import type { MouseEvent, ReactNode } from 'react'
import type { WorkoutLog } from '@/types/fitness'

interface WorkoutCardProps {
  workout: WorkoutLog
  onEdit: () => void
  onDelete: () => void
}

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-light p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{workout.exercise.name}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {workout.exercise.category} · {workout.durationMinutes} min
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton label="Edit workout" onClick={onEdit}>
          <EditIcon />
        </IconButton>
        <IconButton label="Delete workout" onClick={onDelete} variant="danger">
          <TrashIcon />
        </IconButton>
        <span className="rounded-lg bg-mint px-2.5 py-1 text-sm font-bold text-ink">
          {workout.caloriesBurned.toLocaleString()} kcal
        </span>
      </div>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  children,
  variant = 'default',
}: {
  label: string
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  variant?: 'default' | 'danger'
}) {
  const colorClass =
    variant === 'danger'
      ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
      : 'text-white/40 hover:text-white hover:bg-white/5'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${colorClass}`}
    >
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
