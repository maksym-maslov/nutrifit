import { SynergyMacroStat } from '@/components/fitness/SynergyMacroStat'
import { SummaryLoadingSkeleton } from '@/components/fitness/SummaryLoadingSkeleton'
import { computeEarnedGoals, type DailySummary } from '@/types/fitness'

interface DailySummaryCardProps {
  summary: DailySummary | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export function DailySummaryCard({
  summary,
  isLoading,
  error,
  onRetry,
}: DailySummaryCardProps) {
  if (isLoading) {
    return <SummaryLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300 flex items-center justify-between gap-3">
        <span>{error}</span>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-xs font-semibold text-red-200 hover:text-white transition-colors min-h-[44px] px-2"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const earned = computeEarnedGoals(summary.baseGoals, summary.adjustedGoals)

  return (
    <div className="rounded-xl border border-ink-border bg-ink-light p-5">
      <div className="mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Daily Synergy
        </h2>
        {summary.burnedCalories > 0 && (
          <p className="text-[10px] text-cyan-brand mt-1">
            Workouts earned +{summary.burnedCalories.toLocaleString()} kcal today
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SynergyMacroStat
          label="Calories"
          consumed={summary.consumed.calories}
          baseGoal={summary.baseGoals.calories}
          adjustedGoal={summary.adjustedGoals.calories}
          earned={earned.calories}
          burnedCalories={summary.burnedCalories}
        />
        <SynergyMacroStat
          label="Protein"
          consumed={summary.consumed.protein}
          baseGoal={summary.baseGoals.protein}
          adjustedGoal={summary.adjustedGoals.protein}
          earned={earned.protein}
        />
        <SynergyMacroStat
          label="Carbs"
          consumed={summary.consumed.carbs}
          baseGoal={summary.baseGoals.carbs}
          adjustedGoal={summary.adjustedGoals.carbs}
          earned={earned.carbs}
        />
        <SynergyMacroStat
          label="Fat"
          consumed={summary.consumed.fat}
          baseGoal={summary.baseGoals.fat}
          adjustedGoal={summary.adjustedGoals.fat}
          earned={earned.fat}
        />
      </div>
    </div>
  )
}
