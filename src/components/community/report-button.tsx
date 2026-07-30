"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/input";
import { toast } from "sonner";

const REASONS = [
  "Harassment or bullying",
  "Someone is asking for money or fees",
  "Sharing someone's private information",
  "Scam, spam or advertising",
  "Someone may be in danger",
  "Other concern",
] as const;

/**
 * Reporting is a safety-critical action, so it gets a real dialog with a
 * reason and optional detail instead of the previous single button that
 * silently submitted a hardcoded "Reported by member" string.
 */
export function ReportButton({
  action,
  label = "Report",
}: {
  action: (fd: FormData) => Promise<void>;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(fd: FormData) {
    setBusy(true);
    try {
      await action(fd);
      setOpen(false);
      toast.success("Thank you — a moderator will review this privately.");
    } catch {
      toast.error("We couldn't send your report. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-danger transition-colors hover:underline"
        >
          <Flag className="size-3.5" aria-hidden />
          {label}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-[var(--card)] p-5 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-bold">Report this content</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--muted)]">
            Only moderators see reports. The person you report is not told who
            reported them.
          </Dialog.Description>
          <form action={submit} className="mt-4 space-y-4">
            <Field label="What is the problem?" htmlFor="report-reason" required>
              <Select id="report-reason" name="reason" defaultValue={REASONS[0]} required>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Anything else we should know?"
              htmlFor="report-detail"
              hint="Optional. Do not include your own private details."
            >
              <Textarea id="report-detail" name="detail" rows={3} />
            </Field>
            <div className="flex flex-wrap justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="danger" size="sm" disabled={busy} aria-busy={busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {busy ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
