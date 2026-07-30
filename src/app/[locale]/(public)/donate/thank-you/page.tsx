import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { donation } from "@/db/schema";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Thank you", robots: { index: false } };

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { locale } = await params;
  const { id } = await searchParams;
  setRequestLocale(locale);

  let amountCents: number | null = null;
  let currency = "SGD";
  let status: string | null = null;
  if (id) {
    const rows = await db.select().from(donation).where(eq(donation.id, id)).limit(1);
    if (rows[0]) {
      amountCents = rows[0].amountCents;
      currency = rows[0].currency ?? "SGD";
      status = rows[0].status;
    }
  }

  return (
    <Section>
      <Container className="max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700 dark:text-brand-300">
          <Heart className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">Thank you</h1>
        <p className="mt-2 text-[var(--muted)]">
          {amountCents
            ? `Your donation of ${formatMoney(amountCents, currency, locale)} ${status === "completed" ? "was received" : "is being processed"}.`
            : "Your support makes our free programs possible."}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          A receipt will be sent to your registered contact.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </Container>
    </Section>
  );
}
