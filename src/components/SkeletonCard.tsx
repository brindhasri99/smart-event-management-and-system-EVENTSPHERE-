export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video animate-pulse rounded-t-xl bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-4 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-2 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  )
}
