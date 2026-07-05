interface SynergyMacroStatProps {
  label: 'Calories' | 'Protein' | 'Carbs' | 'Fat'
  consumed: number
  baseGoal: number
  adjustedGoal: number
  earned: number
  burnedCalories?: number
}

export function SynergyMacroStat({
  label,
  consumed,
  baseGoal,
  adjustedGoal,
  earned,
  burnedCalories = 0,
}: SynergyMacroStatProps) {
  const isCalories = label === 'Calories'
  const unit = isCalories ? 'kcal' : 'g'
  const decimals = isCalories ? 0 : 1
  const progressPct =
    adjustedGoal > 0 ? Math.min(100, (consumed / adjustedGoal) * 100) : 0
  const basePct = adjustedGoal > 0 ? (baseGoal / adjustedGoal) * 100 : 100
  const earnedPct = adjustedGoal > 0 ? (earned / adjustedGoal) * 100 : 0

  const formatValue = (value: number) =>
    isCalories ? Math.round(value).toLocaleString() : value.toFixed(decimals)

  const formatDelta = (value: number) =>
    isCalories ? Math.round(value).toLocaleString() : value.toFixed(decimals)

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-500"
          style={{ width: `${basePct}%` }}
        />
        {earned > 0 && (
          <div
            className="absolute inset-y-0 bg-cyan-brand/40 transition-all duration-500"
            style={{ left: `${basePct}%`, width: `${earnedPct}%` }}
          />
        )}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-mint transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          {label}
        </p>
        <p className="text-lg font-bold text-white mt-0.5">
          {formatValue(consumed)}
          {!isCalories && (
            <span className="text-xs font-normal text-white/40 ml-0.5">{unit}</span>
          )}
          <span className="text-xs font-normal text-white/30 ml-1.5">
            / {formatValue(adjustedGoal)}
            {!isCalories && unit}
          </span>
        </p>

        {earned > 0 ? (
          <p className="text-[10px] text-cyan-brand mt-1 leading-snug">
            {formatDelta(baseGoal)}
            {isCalories ? ' base' : 'g base'}
            {' + '}
            {formatDelta(earned)}
            {isCalories ? ' earned' : 'g earned'}
            {' → '}
            {formatDelta(adjustedGoal)}
            {isCalories ? ' target' : 'g target'}
          </p>
        ) : (
          <p className="text-[10px] text-white/30 mt-1">
            {formatDelta(baseGoal)}
            {isCalories ? ' kcal target' : 'g target'}
          </p>
        )}

        {isCalories && burnedCalories > 0 && (
          <span className="inline-block mt-1.5 rounded-md bg-cyan-brand/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-brand">
            +{Math.round(burnedCalories).toLocaleString()} kcal earned
          </span>
        )}
      </div>
    </div>
  )
}
