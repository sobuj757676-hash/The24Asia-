import { cn } from "@/lib/utils";

/**
 * Public-page introduction block. Replaces the hand-rolled
 * `<h1 class="text-3xl font-extrabold">` + `<p class="mt-2 …">` pair that was
 * copy-pasted onto ~20 marketing pages with slightly different spacing and
 * max-widths, so every public page now shares one typographic scale.
 */
export function PageIntro({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-8",
        centered && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && <div className="mb-3">{eyebrow}</div>}
      <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed text-[var(--muted)] sm:text-lg",
            centered ? "mx-auto max-w-prose" : "max-w-prose",
          )}
        >
          {description}
        </p>
      )}
      {actions && (
        <div
          className={cn(
            "mt-6 flex flex-wrap items-center gap-3",
            centered && "justify-center",
          )}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

/** Heading for a section within a public page. */
export function PublicSectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 max-w-prose text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
