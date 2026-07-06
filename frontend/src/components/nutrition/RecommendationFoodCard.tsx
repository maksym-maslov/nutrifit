import type { FoodRecommendation } from '@/types/nutrition'

interface RecommendationFoodCardProps {
  food: FoodRecommendation
  onQuickAdd: (food: FoodRecommendation) => void
  disabled?: boolean
}

export function RecommendationFoodCard({
  food,
  onQuickAdd,
  disabled = false,
}: RecommendationFoodCardProps) {
  return (
    <article className="flex min-w-[220px] max-w-[260px] shrink-0 flex-col rounded-xl border border-ink-border bg-ink-light p-4">
      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-semibold text-white leading-snug">{food.name}</h3>
        {food.brand && (
          <p className="text-xs text-white/40 truncate">{food.brand}</p>
        )}
        <span className="inline-flex rounded-full border border-mint/20 bg-mint/10 px-2.5 py-0.5 text-xs font-semibold text-mint">
          {food.caloriesPer100g} kcal/100g
        </span>
        <p className="text-xs text-white/40">
          P: {food.proteinPer100g}g | C: {food.carbsPer100g}g | F: {food.fatPer100g}g
        </p>
      </div>

      <button
        type="button"
        onClick={() => onQuickAdd(food)}
        disabled={disabled}
        className="mt-4 w-full rounded-xl bg-mint py-2.5 text-sm font-bold text-ink hover:bg-mint-dark transition-all active:scale-[0.98] disabled:opacity-50"
      >
        Quick Add
      </button>
    </article>
  )
}
