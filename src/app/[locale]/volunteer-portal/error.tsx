"use client";

import { ErrorView } from "@/components/shell/error-view";

export default function VolunteerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorView error={error} reset={reset} homeHref="/volunteer-portal" homeLabel="Back to dashboard" />
  );
}
