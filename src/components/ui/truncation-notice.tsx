import { Info } from "lucide-react";

/**
 * Every admin list query is capped so a table cannot grow into an unbounded
 * render. When a screen actually hits that cap the operator has to be told —
 * silently showing "the first 200 of 40,000" is how people make decisions on
 * incomplete data.
 */
export function TruncationNotice({
  count,
  limit,
  what = "records",
  hint,
}: {
  count: number;
  limit: number;
  what?: string;
  hint?: string;
}) {
  if (count < limit) return null;
  return (
    <p
      role="status"
      className="mt-3 flex items-start gap-2 rounded-xl border bg-ink-50/70 px-3 py-2.5 text-xs text-[var(--muted)] dark:bg-ink-800/60"
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        Showing the {limit} most recent {what}.{" "}
        {hint ?? "Narrow the list with a filter, or use an export for the full set."}
      </span>
    </p>
  );
}
