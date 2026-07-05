import type { Meal } from '@/types/nutrition'

interface MealCardProps {
  meal: Meal
  isExpanded: boolean
  isActive: boolean
  onToggleExpand: () => void
  onAddFood: () => void
}

export function MealCard({
  meal,
  isExpanded,
  isActive,
  onToggleExpand,
  onAddFood,
}: MealCardProps) {
  return (
    <div
      className={[
        'rounded-xl border bg-ink-light transition-all duration-200',
        isActive ? 'border-mint/50 ring-1 ring-mint/20' : 'border-ink-border',
      ].join(' ')}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 text-left min-w-0"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{meal.name}</h3>
            <ChevronIcon expanded={isExpanded} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/50">
            <span>
              <span className="text-mint font-medium">{meal.totalCalories}</span> kcal
            </span>
            <span>P {meal.totalProtein.toFixed(1)}g</span>
            <span>C {meal.totalCarbs.toFixed(1)}g</span>
            <span>F {meal.totalFat.toFixed(1)}g</span>
          </div>
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-ink-border px-4 pb-4 animate-fade-in">
          {meal.mealItems.length === 0 ? (
            <p className="py-3 text-sm text-white/40">No items logged yet.</p>
          ) : (
            <ul className="py-2 space-y-2">
              {meal.mealItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="text-white/80 truncate">
                    {item.weightG}g {item.food.name}
                  </span>
                  <span className="text-white/40 shrink-0">
                    {item.itemCalories} kcal
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onAddFood}
            className="mt-2 w-full rounded-xl border border-mint/30 bg-mint/10 py-2 text-sm font-semibold text-mint hover:bg-mint/15 transition-all active:scale-[0.98]"
          >
            Add Food
          </button>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 text-white/40 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
