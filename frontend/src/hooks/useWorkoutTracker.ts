import { useCallback, useState } from 'react'
import axios from 'axios'
import { logWorkout } from '@/api/fitnessApi'
import type { WorkoutLog } from '@/types/fitness'
import type { ProblemDetail } from '@/types/auth'

interface LogWorkoutParams {
  exerciseId: number
  durationMinutes: number
  loggedAt: string
}

interface UseWorkoutTrackerResult {
  isSubmitting: boolean
  error: string | null
  clearError: () => void
  logWorkoutEntry: (params: LogWorkoutParams) => Promise<WorkoutLog | null>
}

export function useWorkoutTracker(onSuccess?: () => void | Promise<void>): UseWorkoutTrackerResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const logWorkoutEntry = useCallback(
    async (params: LogWorkoutParams): Promise<WorkoutLog | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const result = await logWorkout(params)
        await onSuccess?.()
        return result
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data as ProblemDetail | undefined
          setError(detail?.detail ?? 'Failed to log workout.')
        } else {
          setError('Failed to log workout.')
        }
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess],
  )

  return { isSubmitting, error, clearError, logWorkoutEntry }
}
