import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const metadata = { robots: { index: false } };

export default async function SupportReceived({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <Container className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700 dark:text-brand-300">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Request received</h1>
        <p className="mt-2 text-[var(--muted)]">
          Thank you for reaching out. A trained team member will contact you
          using your preferred method. This platform is not monitored around the
          clock.
        </p>
        <Button asChild className="mt-6"><Link href="/support">Back to support</Link></Button>
      </Container>
    </Section>
  );
}
