"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateSupportRequest } from "@/server/actions/support";

const STATUSES = [
  "acknowledged",
  "triage",
  "assigned",
  "in_progress",
  "referred",
  "completed",
  "unable_to_contact",
  "unmet_need",
];

export function SupportActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await updateSupportRequest(id, { assignSelf: true, status: "assigned" });
            toast.success("Assigned to you");
          })
        }
      >
        Assign to me
      </Button>
      <select
        defaultValue=""
        disabled={pending}
        onChange={(e) => {
          const status = e.target.value;
          if (!status) return;
          start(async () => {
            await updateSupportRequest(id, { status });
            toast.success(`Marked ${status.replace(/_/g, " ")}`);
          });
        }}
        className="rounded-lg border border-ink-300 bg-transparent px-2 py-1.5 text-sm"
      >
        <option value="">Set status…</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}
