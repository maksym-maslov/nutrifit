import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import axios from 'axios'
import { addMealItem, createMeal } from '@/api/nutritionApi'
import type { Meal } from '@/types/nutrition'
import type { ProblemDetail } from '@/types/auth'

interface UseMealTrackerResult {
  isSubmitting: boolean
  error: string | null
  clearError: () => void
  createMeal: (name: string) => Promise<Meal | null>
  addItem: (
    mealId: number,
    foodId: number,
    weightG: number,
  ) => Promise<Meal | null>
}

export function useMealTracker(
  setMeals: Dispatch<SetStateAction<Meal[]>>,
): UseMealTrackerResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const handleCreateMeal = useCallback(
    async (name: string): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const meal = await createMeal(name)
        setMeals((prev) => [...prev, meal])
        return meal
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data as ProblemDetail | undefined
          setError(detail?.detail ?? 'Failed to create meal.')
        } else {
          setError('Failed to create meal.')
        }
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setMeals],
  )

  const handleAddItem = useCallback(
    async (
      mealId: number,
      foodId: number,
      weightG: number,
    ): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const updatedMeal = await addMealItem(mealId, foodId, weightG)
        setMeals((prev) =>
          prev.map((meal) => (meal.id === mealId ? updatedMeal : meal)),
        )
        return updatedMeal
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const detail = err.response?.data as ProblemDetail | undefined
          setError(detail?.detail ?? 'Failed to log item.')
        } else {
          setError('Failed to log item.')
        }
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [setMeals],
  )

  return {
    isSubmitting,
    error,
    clearError,
    createMeal: handleCreateMeal,
    addItem: handleAddItem,
  }
}
