"use client";

import { ErrorView } from "@/components/shell/error-view";

export default function PartnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView error={error} reset={reset} homeHref="/partner-portal" homeLabel="Back to overview" />
  );
}
