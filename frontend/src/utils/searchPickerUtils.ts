import type { Exercise, WorkoutLog } from '@/types/fitness'
import type { FoodItem, Meal } from '@/types/nutrition'

export const MIN_SEARCH_QUERY_LENGTH = 2
export const MAX_RECENT_ITEMS = 8

export function isSearchQueryActive(query: string): boolean {
  return query.trim().length >= MIN_SEARCH_QUERY_LENGTH
}

export function getRecentFoodsFromMeals(meals: Meal[]): FoodItem[] {
  const sortedMeals = [...meals].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )

  const seen = new Set<number>()
  const recent: FoodItem[] = []

  for (const meal of sortedMeals) {
    for (const item of [...meal.mealItems].reverse()) {
      if (seen.has(item.food.id)) continue
      seen.add(item.food.id)
      recent.push(item.food)
      if (recent.length >= MAX_RECENT_ITEMS) return recent
    }
  }

  return recent
}

export function getRecentExercisesFromWorkouts(workouts: WorkoutLog[]): Exercise[] {
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )

  const seen = new Set<number>()
  const recent: Exercise[] = []

  for (const workout of sortedWorkouts) {
    if (seen.has(workout.exercise.id)) continue
    seen.add(workout.exercise.id)
    recent.push(workout.exercise)
    if (recent.length >= MAX_RECENT_ITEMS) return recent
  }

  return recent
}

export function filterExercisesByQuery(exercises: Exercise[], query: string): Exercise[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(normalized) ||
      exercise.category.toLowerCase().includes(normalized),
  )
}
