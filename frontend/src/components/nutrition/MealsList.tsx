import { MealCard } from '@/components/nutrition/MealCard'
import { EmptyMealsState } from '@/components/nutrition/EmptyMealsState'
import { MealsLoadingSkeleton } from '@/components/nutrition/MealsLoadingSkeleton'
import type { Meal } from '@/types/nutrition'

interface MealsListProps {
  meals: Meal[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onAddMeal: () => void
  expandedMealIds: Set<number>
  activeMealId: number | null
  onToggleExpand: (mealId: number) => void
  onAddFood: (mealId: number) => void
}

export function MealsList({
  meals,
  isLoading,
  error,
  onRetry,
  onAddMeal,
  expandedMealIds,
  activeMealId,
  onToggleExpand,
  onAddFood,
}: MealsListProps) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Meals
        </h2>
        {!isLoading && meals.length > 0 && (
          <span className="text-xs text-white/30">{meals.length} logged</span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 text-xs font-semibold text-red-200 hover:text-white transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <MealsLoadingSkeleton />
      ) : meals.length === 0 ? (
        <EmptyMealsState onAddMeal={onAddMeal} />
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isExpanded={expandedMealIds.has(meal.id)}
              isActive={activeMealId === meal.id}
              onToggleExpand={() => onToggleExpand(meal.id)}
              onAddFood={() => onAddFood(meal.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
