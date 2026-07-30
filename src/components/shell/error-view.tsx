"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RotateCcw } from "lucide-react";

/**
 * Shared error view for route error boundaries. Distinguishes a permission
 * denial from an unexpected failure and never reveals whether a record exists
 * (PRD 14.4 permission-denied route).
 */
export function ErrorView({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Back to home",
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  const forbidden = error.message === "FORBIDDEN";
  const unauth = error.message === "UNAUTHENTICATED";

  const title = forbidden
    ? "You don't have access to this"
    : unauth
      ? "Please sign in to continue"
      : "Something went wrong";

  const body = forbidden
    ? "Your role doesn't include permission for this area. Contact an administrator if you need access."
    : unauth
      ? "Your session may have expired. Sign in again to continue."
      : "An unexpected error occurred. You can retry, or come back in a moment.";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30">
        <ShieldAlert className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {reset && !forbidden && !unauth && (
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-4" aria-hidden /> Try again
          </Button>
        )}
        {unauth ? (
          <Button asChild size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        )}
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-[var(--muted)]">
          Reference: <span className="font-mono">{error.digest}</span>
        </p>
      )}
    </div>
  );
}
