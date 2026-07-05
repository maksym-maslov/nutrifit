import { useMemo, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import type { Exercise } from '@/types/fitness'

interface LogWorkoutPanelProps {
  exercises: Exercise[]
  isLoadingExercises: boolean
  exercisesError: string | null
  onClose: () => void
  onLogWorkout: (exerciseId: number, durationMinutes: number) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

export function LogWorkoutPanel({
  exercises,
  isLoadingExercises,
  exercisesError,
  onClose,
  onLogWorkout,
  isSubmitting,
  error,
}: LogWorkoutPanelProps) {
  const [query, setQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [durationMinutes, setDurationMinutes] = useState('')

  const filteredExercises = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return exercises
    return exercises.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(normalized) ||
        exercise.category.toLowerCase().includes(normalized),
    )
  }, [exercises, query])

  const parsedDuration = Number(durationMinutes)
  const isDurationValid = Number.isInteger(parsedDuration) && parsedDuration > 0
  const canSubmit = selectedExercise !== null && isDurationValid && !isSubmitting

  const handleSubmit = async () => {
    if (!selectedExercise || !isDurationValid) return
    const success = await onLogWorkout(selectedExercise.id, parsedDuration)
    if (success) {
      setSelectedExercise(null)
      setDurationMinutes('')
      setQuery('')
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-cyan-brand/30 bg-ink-light p-4 animate-slide-up">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-brand">
            Log Workout
          </p>
          <p className="text-sm text-white/50 mt-0.5">Select an exercise and duration</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          Done
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search exercises..."
          className="w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-mint focus:ring-2 focus:ring-mint/20 min-h-[44px]"
          aria-label="Search exercises"
        />
        {isLoadingExercises && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="h-4 w-4 text-mint" />
          </div>
        )}
      </div>

      {exercisesError && (
        <p className="mt-2 text-xs text-red-400">{exercisesError}</p>
      )}

      {!isLoadingExercises && filteredExercises.length === 0 && !exercisesError && (
        <p className="mt-3 text-sm text-white/40 text-center py-2">
          {query.trim() ? `No exercises found for "${query.trim()}"` : 'No exercises available.'}
        </p>
      )}

      {filteredExercises.length > 0 && (
        <ul className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-ink-border divide-y divide-ink-border">
          {filteredExercises.map((exercise) => {
            const isSelected = selectedExercise?.id === exercise.id
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => setSelectedExercise(exercise)}
                  className={`w-full min-h-[44px] px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-mint/10 ring-1 ring-inset ring-mint/30'
                      : 'hover:bg-ink'
                  }`}
                >
                  <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {exercise.category} · MET {exercise.metValue}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-4">
        <label htmlFor="duration-minutes" className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Duration (minutes)
        </label>
        <input
          id="duration-minutes"
          type="number"
          min={1}
          inputMode="numeric"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 45"
          className="mt-2 w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-mint focus:ring-2 focus:ring-mint/20 min-h-[44px]"
        />
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={!canSubmit}
        className="mt-4 w-full min-h-[44px] rounded-xl bg-mint px-5 text-sm font-semibold text-ink hover:bg-mint-dark transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting && <Spinner className="h-4 w-4 text-ink" />}
        Log Workout
      </button>
    </section>
  )
}
