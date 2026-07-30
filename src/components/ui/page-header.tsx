import { cn } from "@/lib/utils";

/**
 * Consistent page heading used across every panel screen.
 * Establishes the visual hierarchy: title → description → actions.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && <div className="mb-2 text-sm text-[var(--muted)]">{breadcrumb}</div>}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-balance sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Section heading inside a page. */
export function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
        {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
