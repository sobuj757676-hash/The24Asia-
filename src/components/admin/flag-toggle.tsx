"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleFlag } from "@/server/actions/admin";

export function FlagToggle({
  flagKey,
  enabled,
}: {
  flagKey: string;
  enabled: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await toggleFlag(flagKey, !enabled);
          toast.success(`${flagKey} ${!enabled ? "enabled" : "disabled"}`);
        })
      }
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-brand-600" : "bg-ink-300"
      }`}
    >
      <span className="sr-only">Toggle {flagKey}</span>
      <span
        className={`inline-block size-5 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
