"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

/**
 * Accessible confirmation dialog for destructive/irreversible actions,
 * replacing native window.confirm(). Focus is trapped and returned by Radix,
 * Escape closes, and the trigger reflects the pending state.
 */
export function ConfirmAction({
  action,
  title,
  description,
  confirmLabel = "Confirm",
  triggerLabel,
  triggerVariant = "outline",
  triggerIcon,
  destructive = false,
  successMessage,
  size = "sm",
}: {
  action: () => Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  triggerLabel: string;
  triggerVariant?: "outline" | "ghost" | "danger" | "secondary" | "primary";
  triggerIcon?: React.ReactNode;
  destructive?: boolean;
  successMessage?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant={triggerVariant} size={size}>
          {triggerIcon}
          {triggerLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border bg-[var(--card)] p-6 shadow-xl",
            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
          )}
        >
          <div className="flex items-start gap-3">
            {destructive && (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/30">
                <TriangleAlert className="size-5" aria-hidden />
              </span>
            )}
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-[var(--muted)]">
                  {description}
                </Dialog.Description>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" disabled={pending}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              size="sm"
              variant={destructive ? "danger" : "primary"}
              disabled={pending}
              aria-busy={pending}
              onClick={() =>
                start(async () => {
                  try {
                    await action();
                    if (successMessage) toast.success(successMessage);
                    setOpen(false);
                  } catch {
                    toast.error("That didn't work. Please try again.");
                  }
                })
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {pending ? "Working…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
