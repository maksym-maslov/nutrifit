export function MealsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-ink-border bg-ink-light p-4 animate-pulse"
        >
          <div className="h-4 w-32 rounded-lg bg-ink-border/40" />
          <div className="mt-3 flex gap-3">
            <div className="h-3 w-16 rounded bg-ink-border/40" />
            <div className="h-3 w-12 rounded bg-ink-border/40" />
            <div className="h-3 w-12 rounded bg-ink-border/40" />
          </div>
        </div>
      ))}
    </div>
  )
}
