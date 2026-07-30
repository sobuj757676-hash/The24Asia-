"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/server/actions/enroll";

const initial: ActionState = { ok: false };

/**
 * Generic submit form for auth-guarded actions (apply/register). Surfaces the
 * result both as a toast and as an inline, screen-reader-announced message —
 * a toast alone disappears and is easy to miss on a slow connection.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Submitting…",
  successRedirect,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  pendingLabel?: string;
  successRedirect?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      if (successRedirect) {
        router.push(successRedirect);
        router.refresh();
      }
    } else if (!state.ok && state.error) {
      toast.error(state.error);
    }
  }, [state, router, successRedirect]);

  return (
    <form action={formAction} className="space-y-4">
      <div aria-live="polite">
        {!state.ok && state.error && (
          <p
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-danger-fg dark:border-red-800 dark:bg-red-900/20"
          >
            {state.error}
          </p>
        )}
        {state.ok && state.message && (
          <p className="rounded-xl border border-brand-300 bg-brand-50 px-3 py-2.5 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-200">
            {state.message}
          </p>
        )}
      </div>
      {children}
      <Button type="submit" disabled={pending} aria-busy={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
