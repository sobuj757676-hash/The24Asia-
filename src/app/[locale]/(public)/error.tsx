"use client";

import { ErrorView } from "@/components/shell/error-view";
import { Container, Section } from "@/components/ui/misc";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Section>
      <Container>
        <ErrorView error={error} reset={reset} />
      </Container>
    </Section>
  );
}
