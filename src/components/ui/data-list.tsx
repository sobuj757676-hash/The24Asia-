import { cn } from "@/lib/utils";

/**
 * Responsive record list: a real table on wide screens, stacked cards on
 * small screens — no horizontal scrolling for core tasks (PRD 7.6).
 *
 * Columns declare a `label` used as the header on desktop and as the field
 * label on mobile, so the data stays understandable at every width.
 */
export type Column<T> = {
  key: string;
  label: string;
  /** Render cell content. */
  render: (row: T) => React.ReactNode;
  /** Hide on the mobile card view (e.g. redundant/secondary data). */
  hideOnMobile?: boolean;
  /** Right-align (numbers, actions). */
  align?: "left" | "right";
  /** Treat as the card title on mobile. */
  primary?: boolean;
};

export function DataList<T>({
  columns,
  rows,
  getKey,
  caption,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  caption?: string;
  className?: string;
}) {
  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary);

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border bg-[var(--card)] md:block">
        <table className="w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="border-b bg-ink-50/80 dark:bg-ink-800/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                className="border-b last:border-0 transition-colors hover:bg-ink-50/60 dark:hover:bg-ink-800/40"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn("px-4 py-3 align-middle", c.align === "right" && "text-right")}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li key={getKey(row)} className="rounded-2xl border bg-[var(--card)] p-4">
            <div className="font-medium">{primary?.render(row)}</div>
            <dl className="mt-2 space-y-1.5">
              {rest
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.key} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="shrink-0 text-[var(--muted)]">{c.label}</dt>
                    <dd className="min-w-0 text-right">{c.render(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
