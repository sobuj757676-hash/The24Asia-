import { cn } from "@/lib/utils";

/** Base shimmer block. Respects prefers-reduced-motion via globals.css. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-ink-200/70 dark:bg-ink-700/60", className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/** Matches the StatCard grid used on dashboards. */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-[var(--card)] p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Matches list/card rows. */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border bg-[var(--card)] p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton used by route-level loading.tsx files. */
export function SkeletonPage({
  stats = 0,
  rows = 5,
}: {
  stats?: number;
  rows?: number;
}) {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-80" />
      </div>
      {stats > 0 && <SkeletonStats count={stats} />}
      <SkeletonList rows={rows} />
      <span className="sr-only">Loading…</span>
    </div>
  );
}


/**
 * Card-grid placeholder for public list sections.
 *
 * These fallbacks belong to in-page `<Suspense>` boundaries, NOT to a
 * route-group `loading.tsx`. A `loading.tsx` over the `(public)` group makes
 * every page start streaming immediately, which means a later `notFound()` can
 * no longer set the response status — unknown courses and events silently
 * returned 200 (soft 404s) and would be indexed. Streaming per section keeps
 * both the skeletons and correct status codes.
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-[var(--card)] p-5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="mt-3 h-5 w-3/4" />
          <div className="mt-3">
            <SkeletonText lines={2} />
          </div>
          <Skeleton className="mt-4 h-9 w-28 rounded-xl" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Placeholder for the public impact-figure strip. */
export function StatStripSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-[var(--card)] p-5">
          <Skeleton className="mx-auto h-7 w-16" />
          <Skeleton className="mx-auto mt-2 h-3 w-20" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
