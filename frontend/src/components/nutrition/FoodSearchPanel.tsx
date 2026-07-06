import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useFoodSearch } from '@/hooks/useFoodSearch'
import { PortionInputOverlay } from '@/components/nutrition/PortionInputOverlay'
import { Spinner } from '@/components/ui/Spinner'
import { MIN_SEARCH_QUERY_LENGTH } from '@/utils/searchPickerUtils'
import type { FoodItem } from '@/types/nutrition'

interface FoodSearchPanelProps {
  activeMealId: number
  activeMealName: string
  recentFoods: FoodItem[]
  onDone: () => void
  onLogItem: (foodId: number, weightG: number) => Promise<boolean>
  isSubmitting: boolean
  error: string | null
}

function FoodResultRow({
  food,
  onSelect,
}: {
  food: FoodItem
  onSelect: (food: FoodItem) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(food)}
        className="w-full px-4 py-3 text-left hover:bg-ink transition-colors min-h-[44px]"
      >
        <p className="text-sm font-medium text-white truncate">{food.name}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {food.brand ? `${food.brand} · ` : ''}
          {food.caloriesPer100g} kcal / 100g
        </p>
      </button>
    </li>
  )
}

export function FoodSearchPanel({
  activeMealId,
  activeMealName,
  recentFoods,
  onDone,
  onLogItem,
  isSubmitting,
  error,
}: FoodSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const debouncedQuery = useDebouncedValue(query, 300)
  const { results, isSearching, error: searchError } = useFoodSearch(debouncedQuery)

  const isSearchActive = debouncedQuery.length >= MIN_SEARCH_QUERY_LENGTH

  const handleLogItem = async (weightG: number): Promise<boolean> => {
    if (!selectedFood) return false
    const success = await onLogItem(selectedFood.id, weightG)
    if (success) {
      setSelectedFood(null)
      setQuery('')
    }
    return success
  }

  return (
    <>
      <section className="mt-6 rounded-xl border border-mint/30 bg-ink-light p-4 animate-slide-up">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-mint">
              Adding to
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">{activeMealName}</p>
          </div>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search foods..."
            className="w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-mint focus:ring-2 focus:ring-mint/20 min-h-[44px]"
            aria-label="Search foods"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="h-4 w-4 text-mint" />
            </div>
          )}
        </div>

        {searchError && (
          <p className="mt-2 text-xs text-red-400">{searchError}</p>
        )}

        {!isSearchActive && recentFoods.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
              Recently logged
            </p>
            <ul className="max-h-48 overflow-y-auto rounded-xl border border-ink-border divide-y divide-ink-border">
              {recentFoods.map((food) => (
                <FoodResultRow key={food.id} food={food} onSelect={setSelectedFood} />
              ))}
            </ul>
          </div>
        )}

        {!isSearchActive && recentFoods.length === 0 && (
          <p className="mt-3 text-sm text-white/40 text-center py-2">
            Type at least {MIN_SEARCH_QUERY_LENGTH} characters to search foods
          </p>
        )}

        {isSearchActive && !isSearching && results.length === 0 && !searchError && (
          <p className="mt-3 text-sm text-white/40 text-center py-2">
            No foods found for &ldquo;{debouncedQuery}&rdquo;
          </p>
        )}

        {isSearchActive && results.length > 0 && (
          <ul className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-ink-border divide-y divide-ink-border">
            {results.map((food) => (
              <FoodResultRow key={food.id} food={food} onSelect={setSelectedFood} />
            ))}
          </ul>
        )}

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </section>

      <PortionInputOverlay
        food={selectedFood}
        mealId={activeMealId}
        onClose={() => setSelectedFood(null)}
        onLogItem={handleLogItem}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
