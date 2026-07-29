"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/server/actions/enroll";

const initial: ActionState = { ok: false };

/**
 * Generic submit form for auth-guarded actions (apply/register). Shows a toast
 * on success and optionally redirects. The action is bound server-side with
 * its target id in the page.
 */
export function ActionForm({
  action,
  submitLabel,
  successRedirect,
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
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
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "…" : submitLabel}
      </Button>
    </form>
  );
}
