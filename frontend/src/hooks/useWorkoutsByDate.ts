import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import axios from 'axios'
import { fetchWorkoutsByDate } from '@/api/fitnessApi'
import type { WorkoutLog } from '@/types/fitness'
import type { ProblemDetail } from '@/types/auth'

interface UseWorkoutsByDateResult {
  workouts: WorkoutLog[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setWorkouts: Dispatch<SetStateAction<WorkoutLog[]>>
}

export function useWorkoutsByDate(date: string): UseWorkoutsByDateResult {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchWorkoutsByDate(date)
      setWorkouts(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data as ProblemDetail | undefined
        setError(detail?.detail ?? 'Failed to load workouts.')
      } else {
        setError('Failed to load workouts.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { workouts, isLoading, error, refetch, setWorkouts }
}
