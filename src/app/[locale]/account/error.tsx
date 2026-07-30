"use client";

import { ErrorView } from "@/components/shell/error-view";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView error={error} reset={reset} homeHref="/account" homeLabel="Back to my account" />;
}
