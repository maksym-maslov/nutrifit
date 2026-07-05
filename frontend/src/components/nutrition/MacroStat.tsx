interface MacroStatProps {
  label: string
  value: number
  unit?: string
  accent?: 'mint' | 'cyan'
  decimals?: number
}

export function MacroStat({
  label,
  value,
  unit = 'g',
  accent = 'mint',
  decimals = label === 'Calories' ? 0 : 1,
}: MacroStatProps) {
  const accentClass = accent === 'mint' ? 'bg-mint' : 'bg-cyan-brand'
  const displayValue =
    label === 'Calories' ? Math.round(value).toLocaleString() : value.toFixed(decimals)

  return (
    <div className="flex flex-col gap-2">
      <div className={`h-1 w-full rounded-full ${accentClass} opacity-80`} />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
          {label}
        </p>
        <p className="text-lg font-bold text-white mt-0.5">
          {displayValue}
          {label !== 'Calories' && (
            <span className="text-xs font-normal text-white/40 ml-0.5">{unit}</span>
          )}
        </p>
      </div>
    </div>
  )
}
