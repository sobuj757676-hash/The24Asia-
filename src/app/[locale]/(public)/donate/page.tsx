import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { getFlag, FLAGS } from "@/lib/flags";

export const metadata = { title: "Donate" };

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const paymentEnabled = await getFlag(FLAGS.DONATIONS_PAYMENT);

  return (
    <Section>
      <Container className="max-w-2xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          <Heart className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">Support our mission</h1>
        <p className="mt-2 text-[var(--muted)]">
          Your gift funds free training, community activities and support for
          migrant workers in Singapore.
        </p>

        {paymentEnabled ? (
          <div className="mt-8">
            <Button size="lg" className="w-full sm:w-auto">
              Donate now
            </Button>
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border bg-ink-50 p-6 dark:bg-ink-800">
            <Badge tone="warning">Coming soon</Badge>
            <p className="mt-3 text-sm">
              Online donations are being set up. We are confirming our
              charity/IPC registration and payment provider so every gift is
              handled safely and is tax-compliant.
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              In the meantime, please{" "}
              <Link href="/about/contact" className="text-brand-700 underline">
                contact us
              </Link>{" "}
              to discuss supporting 24Asia.
            </p>
          </div>
        )}
      </Container>
    </Section>
  );
}
