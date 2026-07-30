import { cn } from "@/lib/utils";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700 ring-ink-200 dark:bg-ink-700/60 dark:text-ink-100 dark:ring-ink-600",
  info: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-900/40 dark:text-sky-200 dark:ring-sky-800",
  success: "bg-brand-50 text-brand-800 ring-brand-200 dark:bg-brand-900/40 dark:text-brand-200 dark:ring-brand-800",
  warning: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800",
  danger: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-900/40 dark:text-red-200 dark:ring-red-800",
  brand: "bg-brand-600 text-white ring-brand-700",
};

/**
 * Single source of truth mapping domain statuses to tones, so a status looks
 * identical everywhere it appears. Meaning is never conveyed by colour alone —
 * the label text is always rendered (PRD 14.2 / WCAG 1.4.1).
 */
const STATUS_TONE: Record<string, Tone> = {
  // generic
  published: "success", active: "success", approved: "success", completed: "success",
  valid: "success", paid: "success", present: "success", checked_in: "success",
  passed: "success", confirmed: "success", fulfilled: "success", sent: "success",
  matched: "success", attended: "success", verified: "success",

  draft: "neutral", expected: "neutral", neutral: "neutral", archived: "neutral",
  offered: "info", enrolled: "info", registered: "info", in_progress: "info",
  submitted: "info", requested: "info", queued: "info", scheduled: "info",
  registration_open: "info", probation: "info", accepted: "info",

  pending: "warning", waitlisted: "warning", waitlist_only: "warning",
  under_review: "warning", more_information: "warning", late: "warning",
  awaiting_payment: "warning", screening_pending: "warning", triage: "warning",
  interview: "warning", paused: "warning", needs_review: "warning",

  declined: "danger", rejected: "danger", cancelled: "danger", no_show: "danger",
  failed: "danger", refunded: "danger", revoked: "danger", removed: "danger",
  suspended: "danger", withdrawn: "danger", did_not_complete: "danger",
  unable_to_contact: "danger", unmet_need: "danger", critical: "danger",
  high: "warning", medium: "warning", low: "neutral",
};

export function toneForStatus(status: string): Tone {
  return STATUS_TONE[status?.toLowerCase()] ?? "neutral";
}

/** Humanise snake_case status values. */
export function humanise(value: string): string {
  if (!value) return "";
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Renders a domain status with its canonical tone and a readable label. */
export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Badge tone={tone ?? toneForStatus(status)} className={className}>
      {humanise(status)}
    </Badge>
  );
}
