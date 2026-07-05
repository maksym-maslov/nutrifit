import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import axios from 'axios'
import { fetchMealsByDate } from '@/api/nutritionApi'
import type { Meal } from '@/types/nutrition'
import type { ProblemDetail } from '@/types/auth'

interface UseMealsByDateResult {
  meals: Meal[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  setMeals: Dispatch<SetStateAction<Meal[]>>
}

export function useMealsByDate(date: string): UseMealsByDateResult {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchMealsByDate(date)
      setMeals(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data as ProblemDetail | undefined
        setError(detail?.detail ?? 'Failed to load meals.')
      } else {
        setError('Failed to load meals.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { meals, isLoading, error, refetch, setMeals }
}
