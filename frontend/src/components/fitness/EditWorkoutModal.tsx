import { useEffect, useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { Exercise, WorkoutLog } from '@/types/fitness'

interface EditWorkoutModalProps {
  isOpen: boolean
  workout: WorkoutLog | null
  exercises: Exercise[]
  isLoadingExercises: boolean
  onClose: () => void
  onUpdate: (exerciseId: number, durationMinutes: number) => Promise<void>
  isSubmitting: boolean
  error: string | null
}

export function EditWorkoutModal({
  isOpen,
  workout,
  exercises,
  isLoadingExercises,
  onClose,
  onUpdate,
  isSubmitting,
  error,
}: EditWorkoutModalProps) {
  const [query, setQuery] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [durationMinutes, setDurationMinutes] = useState('')

  useEffect(() => {
    if (isOpen && workout) {
      setQuery('')
      setSelectedExercise(workout.exercise)
      setDurationMinutes(String(workout.durationMinutes))
    }
  }, [isOpen, workout])

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

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedExercise || !isDurationValid) return
    await onUpdate(selectedExercise.id, parsedDuration)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Workout">
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-mint focus:ring-2 focus:ring-mint/20 min-h-[44px]"
            aria-label="Search exercises"
            disabled={isSubmitting}
          />
          {isLoadingExercises && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="h-4 w-4 text-mint" />
            </div>
          )}
        </div>

        {!isLoadingExercises && filteredExercises.length === 0 && (
          <p className="text-sm text-white/40 text-center py-2">
            {query.trim() ? `No exercises found for "${query.trim()}"` : 'No exercises available.'}
          </p>
        )}

        {filteredExercises.length > 0 && (
          <ul className="max-h-48 overflow-y-auto rounded-xl border border-ink-border divide-y divide-ink-border">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedExercise?.id === exercise.id
              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedExercise(exercise)}
                    disabled={isSubmitting}
                    className={`w-full min-h-[44px] px-4 py-3 text-left transition-colors disabled:opacity-50 ${
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

        <div>
          <label
            htmlFor="edit-duration-minutes"
            className="text-xs font-medium text-white/40 uppercase tracking-wider"
          >
            Duration (minutes)
          </label>
          <input
            id="edit-duration-minutes"
            type="number"
            min={1}
            inputMode="numeric"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 45"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-mint focus:ring-2 focus:ring-mint/20 min-h-[44px] disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!canSubmit}
          className="w-full min-h-[44px] rounded-xl bg-mint px-5 text-sm font-semibold text-ink hover:bg-mint-dark transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Spinner className="h-4 w-4 text-ink" />}
          Save Changes
        </button>
      </div>
    </Modal>
  )
}
