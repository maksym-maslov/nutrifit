import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { fetchRecommendations } from '@/api/nutritionApi'
import type { FoodRecommendation } from '@/types/nutrition'
import type { ProblemDetail } from '@/types/auth'

interface UseRecommendationsResult {
  recommendations: FoodRecommendation[]
  isLoading: boolean
  error: string | null
  fetchRecommendations: () => Promise<void>
  clearError: () => void
}

export function useRecommendations(date: string): UseRecommendationsResult {
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRecommendations([])
    setError(null)
    setIsLoading(false)
  }, [date])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadRecommendations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchRecommendations(date)
      setRecommendations(data.slice(0, 3))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data as ProblemDetail | undefined
        setError(detail?.detail ?? 'Could not fetch recommendations. Please try again.')
      } else {
        setError('Could not fetch recommendations. Please try again.')
      }
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }, [date])

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations: loadRecommendations,
    clearError,
  }
}
