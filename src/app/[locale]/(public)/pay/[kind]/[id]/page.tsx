import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { donation, shopOrder } from "@/db/schema";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { confirmTestPayment } from "@/server/actions/donate";
import { PAYMENTS_MODE } from "@/lib/payments/provider";

export const metadata = { title: "Payment", robots: { index: false } };

export default async function TestPayPage({
  params,
}: {
  params: Promise<{ locale: string; kind: string; id: string }>;
}) {
  const { locale, kind, id } = await params;
  setRequestLocale(locale);
  if (kind !== "donation" && kind !== "order") notFound();

  let amountCents = 0;
  let label = "";
  if (kind === "donation") {
    const rows = await db.select().from(donation).where(eq(donation.id, id)).limit(1);
    if (!rows[0]) notFound();
    amountCents = rows[0].amountCents;
    label = "Donation to 24Asia";
  } else {
    const rows = await db.select().from(shopOrder).where(eq(shopOrder.id, id)).limit(1);
    if (!rows[0]) notFound();
    amountCents = rows[0].totalCents;
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
              S${(amountCents / 100).toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              No live payment processor is configured, so this simulates a
              successful payment. Set <code>STRIPE_SECRET_KEY</code> to route
              through Stripe Checkout instead.
            </p>
            <form action={confirm} className="mt-6">
              <Button type="submit" size="lg" className="w-full">
                Complete payment
              </Button>
            </form>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Payment mode: {PAYMENTS_MODE}
            </p>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
}
