export function SummaryLoadingSkeleton() {
  return (
    <div className="rounded-xl border border-ink-border bg-ink-light p-5 animate-pulse">
      <div className="h-3 w-24 rounded bg-ink-border/40 mb-4" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-2 w-full rounded-full bg-ink-border/40" />
            <div className="h-3 w-12 rounded bg-ink-border/40" />
            <div className="h-5 w-20 rounded bg-ink-border/40" />
            <div className="h-2 w-28 rounded bg-ink-border/30" />
          </div>
        ))}
      </div>
    </div>
  )
}
