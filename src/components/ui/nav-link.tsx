import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Back / "see more" links.
 *
 * These exist because the codebase used literal "←" and "→" characters, which
 * render as tofu boxes (missing glyph) in the Inter subset the app loads — the
 * arrows were visibly broken on the homepage and every detail page. Icons are
 * always available and are correctly hidden from assistive tech.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200",
        className,
      )}
    >
      <ArrowLeft
        className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      />
      {children}
    </Link>
  );
}

/** Forward "view all" style link with a trailing arrow icon. */
export function MoreLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200",
        className,
      )}
    >
      {children}
      <ArrowRight
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
