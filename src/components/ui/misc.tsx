import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Layout primitives for the public site.
 *
 * Spacing rhythm: a Section owns its own vertical padding and nothing else
 * adds to it. Previously pages passed extra `py-*` overrides on top of the
 * default, so consecutive bands stacked bottom-padding onto top-padding and
 * produced ~110px of dead space between every section — the main reason the
 * desktop layout read as sparse and unfinished.
 */

type SectionTone = "plain" | "muted" | "brand" | "hero";

const TONE: Record<SectionTone, string> = {
  plain: "",
  // Alternating band so sections read as distinct rather than one long scroll.
  muted: "bg-ink-100/60 dark:bg-ink-800/30",
  brand: "bg-brand-50/70 dark:bg-brand-900/20",
  hero: "bg-gradient-to-b from-brand-50 via-brand-50/40 to-transparent dark:from-brand-900/25 dark:via-brand-900/10",
};

export function Section({
  className,
  tone = "plain",
  divide = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  /** Adds a hairline top border. Use when two same-tone bands meet. */
  divide?: boolean;
}) {
  return (
    <section
      className={cn(
        "py-14 lg:py-20",
        TONE[tone],
        divide && "border-t",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Centred container. `wide` is for grid-heavy pages: at 1440px+ a 1152px
 * column of cards leaves the page looking narrow, so listings get 1280px.
 */
export function Container({
  className,
  size = "default",
  children,
}: {
  className?: string;
  size?: "default" | "wide" | "narrow";
  children: React.ReactNode;
}) {
  const max = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  }[size];
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", max, className)}>
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
    // `h-full` + flex so a two-line label cannot make one card taller than the
    // rest of the row, which left the old strip visibly ragged.
    <div className="flex h-full flex-col rounded-2xl border bg-[var(--card)] p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="text-3xl font-extrabold tabular-nums tracking-tight text-brand-600 sm:text-4xl">
        {value}
      </div>
      <div className="mt-1.5 text-sm font-medium leading-snug">{label}</div>
      {hint ? (
        <div className="mt-auto pt-2 text-xs text-[var(--muted)]">{hint}</div>
      ) : null}
    </div>
  );
}
