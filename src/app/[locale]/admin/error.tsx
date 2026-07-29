"use client";

import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const forbidden = error.message === "FORBIDDEN";
  return (
    <Section>
      <Container className="max-w-lg text-center">
        <h1 className="text-2xl font-bold">
          {forbidden ? "You don't have access to this" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {forbidden
            ? "Your role does not include permission for this area. Contact an administrator if you need access."
            : "Please try again, or contact support if the problem continues."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin">Back to admin home</Link>
        </Button>
      </Container>
    </Section>
  );
}
