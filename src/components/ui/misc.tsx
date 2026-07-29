import * as React from "react";
import { cn } from "@/lib/utils";

/** Small status pill; never relies on color alone (PRD 14.2). */
export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-100 text-ink-700 dark:bg-ink-700 dark:text-ink-100",
    success: "bg-brand-100 text-brand-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    brand: "bg-brand-600 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Section wrapper with consistent rhythm. */
export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-10 sm:py-14", className)} {...props}>
      {children}
    </section>
  );
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

/** Empty state (PRD 14.4). */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      {body ? <p className="mt-1 text-sm text-[var(--muted)]">{body}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** KPI stat used on home + admin dashboards. */
export function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-[var(--card)] p-5 text-center">
      <div className="text-3xl font-extrabold text-brand-600">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      {hint ? (
        <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div>
      ) : null}
    </div>
  );
}
