import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { fetchDailySummary } from '@/api/fitnessApi'
import type { DailySummary } from '@/types/fitness'
import type { ProblemDetail } from '@/types/auth'

interface UseDailySummaryResult {
  summary: DailySummary | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDailySummary(date: string): UseDailySummaryResult {
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchDailySummary(date)
      setSummary(data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data as ProblemDetail | undefined
        setError(detail?.detail ?? 'Failed to load daily summary.')
      } else {
        setError('Failed to load daily summary.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [date])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { summary, isLoading, error, refetch }
}
