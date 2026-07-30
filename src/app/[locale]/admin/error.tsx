"use client";

import { ErrorView } from "@/components/shell/error-view";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} reset={reset} homeHref="/admin" homeLabel="Back to admin home" />;
}
