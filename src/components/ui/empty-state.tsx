import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

/**
 * Meaningful empty state: explains why it's empty and offers the next action,
 * instead of a bare "Nothing here yet" (PRD 14.4).
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
  compact = false,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-[var(--card)]/50 text-center",
        compact ? "p-6" : "p-10",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
