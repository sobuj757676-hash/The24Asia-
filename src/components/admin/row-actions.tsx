"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

/**
 * Generic destructive/confirm action button that invokes a bound server
 * action. Used across admin lists for delete/toggle operations.
 */
export function ActionButton({
  action,
  label,
  confirm,
  variant = "outline",
  icon,
  successMessage,
}: {
  action: () => Promise<void>;
  label: string;
  confirm?: string;
  variant?: "outline" | "danger" | "ghost" | "secondary";
  icon?: boolean;
  successMessage?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          await action();
          if (successMessage) toast.success(successMessage);
        });
      }}
    >
      {icon ? <Trash2 className="size-4" aria-hidden /> : null}
      {label}
    </Button>
  );
}
