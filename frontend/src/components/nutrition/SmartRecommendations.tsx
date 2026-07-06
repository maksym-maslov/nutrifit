import { useCallback, useEffect, useState } from 'react'
import { PortionInputOverlay } from '@/components/nutrition/PortionInputOverlay'
import { RecommendationFoodCard } from '@/components/nutrition/RecommendationFoodCard'
import { Toast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { useRecommendations } from '@/hooks/useRecommendations'
import type { FoodItem, FoodRecommendation } from '@/types/nutrition'

interface SmartRecommendationsProps {
  date: string
  activeMealId: number | null
  onLogItem: (foodId: number, weightG: number) => Promise<boolean>
  onLogSuccess: () => void
  onNeedMeal: () => void
  isSubmitting: boolean
}

function toFoodItem(recommendation: FoodRecommendation): FoodItem {
  return recommendation
}

export function SmartRecommendations({
  date,
  activeMealId,
  onLogItem,
  onLogSuccess,
  onNeedMeal,
  isSubmitting,
}: SmartRecommendationsProps) {
  const {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    clearError,
  } = useRecommendations(date)

  const [hasFetched, setHasFetched] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodRecommendation | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    setHasFetched(false)
  }, [date])

  useEffect(() => {
    if (error) {
      setToastMessage(error)
    }
  }, [error])

  const handleSuggest = useCallback(async () => {
    clearError()
    setHasFetched(true)
    await fetchRecommendations()
  }, [clearError, fetchRecommendations])

  const handleQuickAdd = useCallback(
    (food: FoodRecommendation) => {
      if (!activeMealId) {
        setToastMessage('Create or select a meal first')
        onNeedMeal()
        return
      }
      setSelectedFood(food)
    },
    [activeMealId, onNeedMeal],
  )

  const handleLogPortion = useCallback(
    async (weightG: number): Promise<boolean> => {
      if (!selectedFood) return false
      const success = await onLogItem(selectedFood.id, weightG)
      if (success) {
        setSelectedFood(null)
        onLogSuccess()
      }
      return success
    },
    [selectedFood, onLogItem, onLogSuccess],
  )

  const showCards = recommendations.length > 0
  const showInitialButton = !showCards

  return (
    <>
      <section className="rounded-xl border border-mint/20 bg-ink-light p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
          Smart Recommendations
        </p>

        {showInitialButton && (
          <button
            type="button"
            onClick={() => void handleSuggest()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-mint/30 bg-ink py-3.5 text-sm font-semibold text-white transition-all hover:border-mint/50 hover:bg-ink-light disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Spinner className="h-4 w-4 text-mint" />
                Finding suggestions...
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                Suggest Meal for Remaining Macros
              </>
            )}
          </button>
        )}

        {showCards && (
          <div className="space-y-3">
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-hide">
              {recommendations.map((food) => (
                <RecommendationFoodCard
                  key={food.id}
                  food={food}
                  onQuickAdd={handleQuickAdd}
                  disabled={isSubmitting}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => void handleSuggest()}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs font-medium text-mint hover:text-mint-dark transition-colors disabled:opacity-50"
            >
              {isLoading && <Spinner className="h-3 w-3 text-mint" />}
              Get new suggestions
            </button>
          </div>
        )}

        {hasFetched && !isLoading && recommendations.length === 0 && !error && (
          <p className="mt-3 text-sm text-white/40 text-center">
            No recommendations available right now.
          </p>
        )}
      </section>

      {activeMealId !== null && (
        <PortionInputOverlay
          food={selectedFood ? toFoodItem(selectedFood) : null}
          mealId={activeMealId}
          onClose={() => setSelectedFood(null)}
          onLogItem={handleLogPortion}
          isSubmitting={isSubmitting}
          defaultWeightG={100}
          title="Portion Size (g)"
        />
      )}

      <Toast
        message={toastMessage}
        onDismiss={() => {
          setToastMessage(null)
          clearError()
        }}
      />
    </>
  )
}
