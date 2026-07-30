"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-dialog";

/**
 * Row action button.
 *
 * When `confirm` is supplied it renders an accessible ConfirmAction dialog
 * (previously a native window.confirm, which is unstyled, not themeable and
 * blocks the main thread). Otherwise it performs the action directly with a
 * pending state so the row can't be double-submitted.
 */
export function ActionButton({
  action,
  label,
  confirm,
  confirmTitle,
  variant = "outline",
  icon,
  successMessage,
}: {
  action: () => Promise<void>;
  label: string;
  confirm?: string;
  confirmTitle?: string;
  variant?: "outline" | "danger" | "ghost" | "secondary" | "primary";
  icon?: boolean;
  successMessage?: string;
}) {
  const [pending, start] = useTransition();

  if (confirm) {
    return (
      <ConfirmAction
        action={action}
        triggerLabel={label}
        triggerVariant={variant}
        triggerIcon={icon ? <Trash2 className="size-4" aria-hidden /> : undefined}
        title={confirmTitle ?? label}
        description={confirm}
        confirmLabel={label}
        destructive={variant === "danger"}
        successMessage={successMessage}
      />
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      aria-busy={pending}
      onClick={() =>
        start(async () => {
          try {
            await action();
            if (successMessage) toast.success(successMessage);
          } catch {
            toast.error("That didn't work. Please try again.");
          }
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : icon ? (
        <Trash2 className="size-4" aria-hidden />
      ) : null}
      {label}
    </Button>
  );
}
