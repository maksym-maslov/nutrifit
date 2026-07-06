import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'
import axios from 'axios'
import {
  addMealItem,
  createMeal,
  deleteMeal,
  deleteMealItem,
  updateMeal,
  updateMealItem,
} from '@/api/nutritionApi'
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
  updateMealName: (mealId: number, name: string) => Promise<Meal | null>
  removeMeal: (mealId: number) => Promise<boolean>
  updateItem: (
    mealId: number,
    itemId: number,
    foodId: number,
    weightG: number,
  ) => Promise<Meal | null>
  removeItem: (mealId: number, itemId: number) => Promise<Meal | null>
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data as ProblemDetail | undefined
    return detail?.detail ?? fallback
  }
  return fallback
}

export function useMealTracker(
  setMeals: Dispatch<SetStateAction<Meal[]>>,
): UseMealTrackerResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const replaceMealInState = useCallback(
    (updatedMeal: Meal) => {
      setMeals((prev) =>
        prev.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)),
      )
    },
    [setMeals],
  )

  const handleCreateMeal = useCallback(
    async (name: string): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const meal = await createMeal(name)
        setMeals((prev) => [...prev, meal])
        return meal
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to create meal.'))
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
        replaceMealInState(updatedMeal)
        return updatedMeal
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to log item.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [replaceMealInState],
  )

  const handleUpdateMealName = useCallback(
    async (mealId: number, name: string): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const updatedMeal = await updateMeal(mealId, name)
        replaceMealInState(updatedMeal)
        return updatedMeal
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update meal.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [replaceMealInState],
  )

  const handleRemoveMeal = useCallback(
    async (mealId: number): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await deleteMeal(mealId)
        setMeals((prev) => prev.filter((meal) => meal.id !== mealId))
        return true
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to delete meal.'))
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [setMeals],
  )

  const handleUpdateItem = useCallback(
    async (
      mealId: number,
      itemId: number,
      foodId: number,
      weightG: number,
    ): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const updatedMeal = await updateMealItem(mealId, itemId, foodId, weightG)
        replaceMealInState(updatedMeal)
        return updatedMeal
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to update item.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [replaceMealInState],
  )

  const handleRemoveItem = useCallback(
    async (mealId: number, itemId: number): Promise<Meal | null> => {
      setIsSubmitting(true)
      setError(null)
      try {
        const updatedMeal = await deleteMealItem(mealId, itemId)
        replaceMealInState(updatedMeal)
        return updatedMeal
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to delete item.'))
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [replaceMealInState],
  )

  return {
    isSubmitting,
    error,
    clearError,
    createMeal: handleCreateMeal,
    addItem: handleAddItem,
    updateMealName: handleUpdateMealName,
    removeMeal: handleRemoveMeal,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
  }
}
