import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

/**
 * Dashboard metric tile. Label sits above the value so screen readers and
 * scanning eyes get context first, and long values never break the layout.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  tone = "brand",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
  tone?: "brand" | "accent" | "indigo" | "neutral";
  className?: string;
}) {
  const toneClass = {
    brand: "text-brand-600 bg-brand-50 dark:bg-brand-900/30",
    accent: "text-accent-600 bg-accent-500/10",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30",
    neutral: "text-ink-600 bg-ink-100 dark:bg-ink-800",
  }[tone];

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
        {icon && (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", toneClass)}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>}
    </>
  );

  const base =
    "rounded-2xl border bg-[var(--card)] p-4 shadow-sm transition-shadow sm:p-5";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(base, "block hover:border-brand-400 hover:shadow-md", className)}
      >
        {body}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{body}</div>;
}

/** Responsive grid wrapper for StatCards. */
export function StatGrid({
  children,
  cols = 4,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[cols];
  return <div className={cn("grid gap-3 sm:gap-4", colClass)}>{children}</div>;
}
