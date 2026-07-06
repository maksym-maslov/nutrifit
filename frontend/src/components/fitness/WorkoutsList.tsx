import { WorkoutCard } from '@/components/fitness/WorkoutCard'
import { WorkoutsLoadingSkeleton } from '@/components/fitness/WorkoutsLoadingSkeleton'
import type { WorkoutLog } from '@/types/fitness'

interface WorkoutsListProps {
  workouts: WorkoutLog[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onLogWorkout: () => void
  onEditWorkout: (workoutId: number) => void
  onDeleteWorkout: (workoutId: number) => void
}

export function WorkoutsList({
  workouts,
  isLoading,
  error,
  onRetry,
  onLogWorkout,
  onEditWorkout,
  onDeleteWorkout,
}: WorkoutsListProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Workouts
          </h2>
          {!isLoading && workouts.length > 0 && (
            <span className="text-xs text-white/30">{workouts.length} logged</span>
          )}
        </div>
        <button
          type="button"
          onClick={onLogWorkout}
          className="shrink-0 min-h-[44px] rounded-xl border border-mint/30 bg-mint/10 px-3 text-xs font-semibold text-mint hover:bg-mint/20 transition-colors"
        >
          + Log Workout
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 text-xs font-semibold text-red-200 hover:text-white transition-colors min-h-[44px] px-2"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <WorkoutsLoadingSkeleton />
      ) : workouts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-border bg-ink-light/50 px-4 py-8 text-center">
          <p className="text-sm text-white/40">No workouts logged for this day.</p>
          <button
            type="button"
            onClick={onLogWorkout}
            className="mt-3 min-h-[44px] rounded-xl bg-mint px-4 text-sm font-semibold text-ink hover:bg-mint-dark transition-colors"
          >
            Log your first workout
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={() => onEditWorkout(workout.id)}
              onDelete={() => onDeleteWorkout(workout.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
