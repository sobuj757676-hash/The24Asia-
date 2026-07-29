import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { getFlag, FLAGS } from "@/lib/flags";
import { startDonation, getActiveCampaigns } from "@/server/actions/donate";
import { PAYMENTS_MODE } from "@/lib/payments/provider";

export const metadata = { title: "Donate" };

const PRESETS = [10, 25, 50, 100];

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const paymentEnabled = await getFlag(FLAGS.DONATIONS_PAYMENT);
  const campaigns = paymentEnabled ? await getActiveCampaigns() : [];

  return (
    <Section>
      <Container className="max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          <Heart className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">Support our mission</h1>
        <p className="mt-2 text-[var(--muted)]">
          Your gift funds free training, community activities and support for
          migrant workers in Singapore.
        </p>

        {paymentEnabled ? (
          <form action={startDonation} className="mx-auto mt-8 max-w-sm space-y-4 text-left">
            {PAYMENTS_MODE === "test" && (
              <p className="rounded-lg bg-amber-50 p-2 text-center text-xs text-amber-800">
                Test payment mode — configure Stripe to accept live gifts.
              </p>
            )}
            {campaigns.length > 0 && (
              <Field label="Campaign" htmlFor="campaignId">
                <select
                  id="campaignId"
                  name="campaignId"
                  className="flex h-11 w-full rounded-xl border border-ink-300 bg-[var(--card)] px-3"
                >
                  <option value="">General fund</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Amount (SGD)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" min="1" step="1" defaultValue={25} required />
            </Field>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <span key={p} className="rounded-full border px-3 py-1 text-sm text-[var(--muted)]">
                  S${p}
                </span>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="anonymous" className="size-5" />
              Make my donation anonymous
            </label>
            <Button type="submit" size="lg" className="w-full">
              Continue to payment
            </Button>
            <p className="text-xs text-[var(--muted)]">
              Secure checkout. We never store your card details.
            </p>
          </form>
        ) : (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border bg-ink-50 p-6 dark:bg-ink-800">
            <Badge tone="warning">Coming soon</Badge>
            <p className="mt-3 text-sm">
              Online donations are being set up. Please{" "}
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
