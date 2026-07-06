import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import axios from 'axios'
import { deleteWorkout, logWorkout, updateWorkout } from '@/api/fitnessApi'
import type { WorkoutLog } from '@/types/fitness'
import type { ProblemDetail } from '@/types/auth'

interface LogWorkoutParams {
  exerciseId: number
  durationMinutes: number
  loggedAt: string
}

interface UpdateWorkoutParams {
  exerciseId: number
  durationMinutes: number
}

interface UseWorkoutTrackerResult {
  isSubmitting: boolean
  error: string | null
  clearError: () => void
  logWorkoutEntry: (params: LogWorkoutParams) => Promise<WorkoutLog | null>
  updateWorkoutEntry: (
    id: number,
    params: UpdateWorkoutParams,
  ) => Promise<WorkoutLog | null>
  removeWorkoutEntry: (id: number) => Promise<boolean>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data as ProblemDetail | undefined
    return detail?.detail ?? fallback
  }
  return fallback
}

export function useWorkoutTracker(
  setWorkouts: Dispatch<SetStateAction<WorkoutLog[]>>,
  onSuccess?: () => void | Promise<void>,
): UseWorkoutTrackerResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const logWorkoutEntry = useCallback(
    async (params: LogWorkoutParams): Promise<WorkoutLog | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const result = await logWorkout(params)
        setWorkouts((prev) => [...prev, result])
        await onSuccess?.()
        return result
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to log workout.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setWorkouts, onSuccess],
  )

  const updateWorkoutEntry = useCallback(
    async (id: number, params: UpdateWorkoutParams): Promise<WorkoutLog | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const result = await updateWorkout(id, params)
        setWorkouts((prev) =>
          prev.map((workout) => (workout.id === id ? result : workout)),
        )
        await onSuccess?.()
        return result
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update workout.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setWorkouts, onSuccess],
  )

  const removeWorkoutEntry = useCallback(
    async (id: number): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await deleteWorkout(id)
        setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
        await onSuccess?.()
        return true
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to delete workout.'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [setWorkouts, onSuccess],
  )

  return {
    isSubmitting,
    error,
    clearError,
    logWorkoutEntry,
    updateWorkoutEntry,
    removeWorkoutEntry,
  }
}
