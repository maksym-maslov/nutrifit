import type { WorkoutLog } from '@/types/fitness'

interface WorkoutCardProps {
  workout: WorkoutLog
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-light p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{workout.exercise.name}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {workout.exercise.category} · {workout.durationMinutes} min
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-mint px-2.5 py-1 text-sm font-bold text-ink">
        {workout.caloriesBurned.toLocaleString()} kcal
      </span>
    </div>
  )
}
