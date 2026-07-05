import { MacroStat } from '@/components/nutrition/MacroStat'

interface DailySummary {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

interface DailySummaryCardProps {
  summary: DailySummary
}

export function DailySummaryCard({ summary }: DailySummaryCardProps) {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-light p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
        Daily Totals
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MacroStat label="Calories" value={summary.totalCalories} accent="mint" />
        <MacroStat label="Protein" value={summary.totalProtein} accent="cyan" />
        <MacroStat label="Carbs" value={summary.totalCarbs} accent="mint" />
        <MacroStat label="Fat" value={summary.totalFat} accent="cyan" />
      </div>
    </div>
  )
}
