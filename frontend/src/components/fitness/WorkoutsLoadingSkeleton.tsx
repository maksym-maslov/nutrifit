export function WorkoutsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-ink-border bg-ink-light p-4 animate-pulse flex items-center justify-between gap-3"
        >
          <div className="flex-1">
            <div className="h-4 w-36 rounded-lg bg-ink-border/40" />
            <div className="mt-2 h-3 w-24 rounded bg-ink-border/40" />
          </div>
          <div className="h-7 w-16 rounded-lg bg-ink-border/40" />
        </div>
      ))}
    </div>
  )
}
