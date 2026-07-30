"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleFlag } from "@/server/actions/admin";

/**
 * Accessible switch for a capability flag. Uses role="switch" with
 * aria-checked so assistive tech announces state, and reflects pending
 * requests so it can't be toggled twice.
 */
export function FlagToggle({
  flagKey,
  enabled,
  label,
}: {
  flagKey: string;
  enabled: boolean;
  label?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label ? `${label} — ${enabled ? "enabled" : "disabled"}` : flagKey}
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          try {
            await toggleFlag(flagKey, !enabled);
            toast.success(`${label ?? flagKey} ${!enabled ? "enabled" : "disabled"}`);
          } catch {
            toast.error("Could not change that setting. Please try again.");
          }
        })
      }
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        enabled ? "bg-brand-600" : "bg-ink-300 dark:bg-ink-600",
        pending && "opacity-60",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 transform rounded-full bg-white shadow transition-transform",
          enabled ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
