import { useEffect, useState } from 'react'
import axios from 'axios'
import { searchFoods } from '@/api/nutritionApi'
import type { FoodItem } from '@/types/nutrition'
import type { ProblemDetail } from '@/types/auth'

interface UseFoodSearchResult {
  results: FoodItem[]
  isSearching: boolean
  error: string | null
}

export function useFoodSearch(debouncedQuery: string): UseFoodSearchResult {
  const [results, setResults] = useState<FoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setError(null)
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)
    setError(null)

    searchFoods(debouncedQuery)
      .then((data) => {
        if (!cancelled) setResults(data)
      })
      .catch((err) => {
        if (cancelled) return
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data as ProblemDetail | undefined
          setError(detail?.detail ?? 'Search failed.')
        } else {
          setError('Search failed.')
        }
        setResults([])
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  return { results, isSearching, error }
}
