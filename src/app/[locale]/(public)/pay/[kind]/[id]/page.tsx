import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { donation, shopOrder } from "@/db/schema";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { Card, CardBody } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { confirmTestPayment } from "@/server/actions/donate";
import { PAYMENTS_MODE } from "@/lib/payments/provider";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Payment", robots: { index: false } };

export default async function TestPayPage({
  params,
}: {
  params: Promise<{ locale: string; kind: string; id: string }>;
}) {
  const { locale, kind, id } = await params;
  setRequestLocale(locale);
  if (kind !== "donation" && kind !== "order") notFound();

  // This simulator only exists in test mode. In any other mode it must not be
  // reachable at all — previously it rendered a "Complete payment" button that
  // the server action rejects, and it exposed donation amounts by id.
  if (PAYMENTS_MODE !== "test") notFound();

  let amountCents = 0;
  let currency = "SGD";
  let label = "";
  let alreadyPaid = false;
  if (kind === "donation") {
    const rows = await db.select().from(donation).where(eq(donation.id, id)).limit(1);
    if (!rows[0]) notFound();
    amountCents = rows[0].amountCents;
    currency = rows[0].currency ?? "SGD";
    alreadyPaid = rows[0].status === "completed";
    label = "Donation to 24Asia";
  } else {
    const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, id)).limit(1);
    if (!rows[0]) notFound();
    amountCents = rows[0].totalCents;
    currency = rows[0].currency ?? "SGD";
    alreadyPaid = rows[0].status === "confirmed" || rows[0].status === "fulfilled";
    label = "24Asia shop order";
  }

  const confirm = confirmTestPayment.bind(null, kind, id);

  return (
    <Section>
      <Container className="max-w-md">
        <Card>
          <CardBody className="text-center">
            <Badge tone="warning">Test payment mode</Badge>
            <h1 className="mt-3 text-xl font-bold">{label}</h1>
            <p className="mt-2 text-3xl font-extrabold text-brand-600">
              {formatMoney(amountCents, currency, locale)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No live payment processor is configured, so this simulates a
              successful payment. Set <code>STRIPE_SECRET_KEY</code> to route
              through Stripe Checkout instead.
            </p>
            {alreadyPaid ? (
              <p className="mt-6 rounded-xl bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
                This payment has already been completed.
              </p>
            ) : (
              <form action={confirm} className="mt-6">
                <SubmitButton size="lg" className="w-full" pendingLabel="Completing…">
                  Complete payment
                </SubmitButton>
              </form>
            )}
            <p className="mt-2 text-xs text-[var(--muted)]">
              Payment mode: {PAYMENTS_MODE}
            </p>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
}
