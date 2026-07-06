import type { MouseEvent, ReactNode } from 'react'
import type { Meal, MealItem } from '@/types/nutrition'

interface MealCardProps {
  meal: Meal
  isExpanded: boolean
  isActive: boolean
  onToggleExpand: () => void
  onAddFood: () => void
  onEditMeal: () => void
  onDeleteMeal: () => void
  onEditItem: (item: MealItem) => void
  onDeleteItem: (itemId: number) => void
}

export function MealCard({
  meal,
  isExpanded,
  isActive,
  onToggleExpand,
  onAddFood,
  onEditMeal,
  onDeleteMeal,
  onEditItem,
  onDeleteItem,
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

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            label="Edit meal"
            onClick={(e) => {
              e.stopPropagation()
              onEditMeal()
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            label="Delete meal"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteMeal()
            }}
            variant="danger"
          >
            <TrashIcon />
          </IconButton>
        </div>
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
                  <span className="text-white/80 truncate min-w-0">
                    {item.weightG}g {item.food.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-white/40">{item.itemCalories} kcal</span>
                    <IconButton
                      label="Edit item"
                      onClick={() => onEditItem(item)}
                      size="sm"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      label="Delete item"
                      onClick={() => onDeleteItem(item.id)}
                      variant="danger"
                      size="sm"
                    >
                      <TrashIcon />
                    </IconButton>
                  </div>
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

function IconButton({
  label,
  onClick,
  children,
  variant = 'default',
  size = 'md',
}: {
  label: string
  onClick: (e: MouseEvent<HTMLButtonElement>) => void
  children: ReactNode
  variant?: 'default' | 'danger'
  size?: 'sm' | 'md'
}) {
  const sizeClass = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const colorClass =
    variant === 'danger'
      ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
      : 'text-white/40 hover:text-white hover:bg-white/5'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-lg transition-colors ${sizeClass} ${colorClass}`}
    >
      {children}
    </button>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
