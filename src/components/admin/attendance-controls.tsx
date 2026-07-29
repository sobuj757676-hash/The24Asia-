"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markAttendance } from "@/server/actions/attendance";
import { cn } from "@/lib/utils";

const OPTIONS: { value: "present" | "late" | "excused" | "no_show"; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
  { value: "no_show", label: "No-show" },
];

export function AttendanceControls({
  sessionId,
  personId,
  current,
}: {
  sessionId: string;
  personId: string;
  current: string;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await markAttendance(sessionId, personId, o.value);
              toast.success(`Marked ${o.label}`);
            })
          }
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs font-medium",
            current === o.value
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
