interface EmptyMealsStateProps {
  onAddMeal: () => void
}

export function EmptyMealsState({ onAddMeal }: EmptyMealsStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-ink-border bg-ink-light/50 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint/10">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-mint"
          aria-hidden="true"
        >
          <path
            d="M12 2v20M2 12h20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white">No meals logged</h3>
      <p className="mt-1.5 text-sm text-white/40">
        Start tracking your nutrition by adding your first meal.
      </p>
      <button
        type="button"
        onClick={onAddMeal}
        className="mt-5 rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-ink hover:bg-mint-dark transition-all active:scale-[0.98]"
      >
        Add Meal
      </button>
    </div>
  )
}
