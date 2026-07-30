"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "./button";

/**
 * Submit button that automatically reflects the enclosing form's pending state.
 * Prevents double submission and gives users immediate feedback — previously
 * every server-action form submitted silently with no indication.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}
