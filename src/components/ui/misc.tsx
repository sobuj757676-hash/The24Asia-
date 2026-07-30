import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Layout primitives for the public site.
 *
 * The deprecated `Badge` / `EmptyState` compatibility wrappers that used to
 * live here have been removed now that every call site imports directly from
 * `./status-badge` and `./empty-state` — one implementation, one import path.
 */

/** Vertical rhythm wrapper for public page sections. */
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

/** Centered max-width container with responsive gutters. */
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

/**
 * Public-facing impact figure. Number-first presentation (unlike the admin
 * StatCard) because on marketing pages the figure is the message.
 */
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
    <div className="rounded-2xl border bg-[var(--card)] p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="text-2xl font-extrabold tabular-nums text-brand-600 sm:text-3xl">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}
