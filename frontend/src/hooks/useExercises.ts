import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { fetchExercises } from '@/api/fitnessApi'
import type { Exercise } from '@/types/fitness'
import type { ProblemDetail } from '@/types/auth'

interface UseExercisesResult {
  exercises: Exercise[]
  isLoading: boolean
  error: string | null
}

export function useExercises(): UseExercisesResult {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchExercises()
      setExercises(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data as ProblemDetail | undefined
        setError(detail?.detail ?? 'Failed to load exercises.')
      } else {
        setError('Failed to load exercises.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { exercises, isLoading, error }
}
