import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge as BadgeBase, type Tone } from "./status-badge";
import { EmptyState as EmptyStateBase } from "./empty-state";

/**
 * Layout primitives for the public site, plus thin compatibility wrappers that
 * delegate to the canonical design-system components. Keeping these wrappers
 * means every existing page picked up the upgraded visuals (ring borders,
 * richer empty states, dark-mode-correct tones) without a mechanical edit to
 * 60 files — and there is still only ONE implementation of each component.
 *
 * New code should import directly from `./status-badge`, `./empty-state` and
 * `./stat-card`.
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

/** @deprecated Import `Badge` from `@/components/ui/status-badge`. */
export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <BadgeBase tone={tone} className={className}>
      {children}
    </BadgeBase>
  );
}

/**
 * @deprecated Import `EmptyState` from `@/components/ui/empty-state`.
 * Accepts the legacy `body` prop as an alias for `description`.
 */
export function EmptyState({
  title,
  body,
  description,
  action,
  icon,
}: {
  title: string;
  body?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <EmptyStateBase
      title={title}
      description={description ?? body}
      action={action}
      icon={icon}
    />
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
