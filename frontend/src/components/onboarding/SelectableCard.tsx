import type { ReactNode } from 'react'

interface SelectableCardProps {
  title: string
  subtitle?: string
  selected: boolean
  onSelect: () => void
  className?: string
  children?: ReactNode
}

export function SelectableCard({
  title,
  subtitle,
  selected,
  onSelect,
  className = '',
  children,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'w-full rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98]',
        selected
          ? 'border-2 border-mint bg-mint/5'
          : 'border border-ink-border bg-ink hover:border-mint/40',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="block text-sm font-semibold text-white">{title}</span>
      {subtitle && (
        <span className="mt-1 block text-xs text-white/50">{subtitle}</span>
      )}
      {children}
    </button>
  )
}
