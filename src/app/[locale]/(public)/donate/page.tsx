import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { Field, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { CheckboxField } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";
import { DonationAmount } from "@/components/public/donation-amount";
import { Heart, Lock, ShieldCheck } from "lucide-react";
import { getFlag, FLAGS } from "@/lib/flags";
import { startDonation, getActiveCampaigns } from "@/server/actions/donate";
import { PAYMENTS_MODE } from "@/lib/payments/provider";

export const metadata = { title: "Donate" };

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
      <Container className="max-w-xl">
        <div className="text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            <Heart className="size-8" aria-hidden />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Support our mission
          </h1>
          <p className="mt-3 text-[var(--muted)]">
            Your gift funds free training, community activities and support for
            migrant workers in Singapore.
          </p>
        </div>

        {/* Where the money goes — donors give more when they know */}
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { amount: "S$25", use: "Course materials for one learner" },
            { amount: "S$50", use: "Refreshments for a community event" },
            { amount: "S$100", use: "Emergency support for a worker in crisis" },
          ].map((row) => (
            <li
              key={row.amount}
              className="rounded-2xl border bg-[var(--card)] p-4 text-center shadow-sm"
            >
              <p className="text-lg font-bold text-brand-600">{row.amount}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{row.use}</p>
            </li>
          ))}
        </ul>

        {paymentEnabled ? (
          <Card className="mt-8">
            <CardBody>
              {PAYMENTS_MODE === "test" && (
                <p className="mb-4 rounded-xl bg-amber-50 p-2.5 text-center text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                  Test payment mode — configure Stripe to accept live gifts.
                </p>
              )}
              <form action={startDonation} className="space-y-5">
                {campaigns.length > 0 && (
                  <Field
                    label="Campaign"
                    htmlFor="campaignId"
                    hint="Choose a campaign, or give to the general fund."
                  >
                    <Select id="campaignId" name="campaignId" defaultValue="">
                      <option value="">General fund</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </Select>
                  </Field>
                )}

                <DonationAmount />

                <CheckboxField
                  name="anonymous"
                  label="Make my donation anonymous"
                  description="Your name won't appear in any public thank-you list."
                />

                <SubmitButton size="lg" className="w-full" pendingLabel="Redirecting…">
                  Continue to payment
                </SubmitButton>

                <div className="flex items-start gap-2 text-xs text-[var(--muted)]">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <p>
                    Secure checkout. We never see or store your card details, and we
                    never sell donor data.
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        ) : (
          <Card className="mt-8">
            <CardBody className="text-center">
              <Badge tone="warning">Coming soon</Badge>
              <p className="mt-3 text-sm">
                Online donations are being set up. Please{" "}
                <Link href="/about/contact" className="font-medium text-brand-700 dark:text-brand-300 underline">
                  contact us
                </Link>{" "}
                to discuss supporting 24Asia — we can arrange a bank transfer or
                in-kind support.
              </p>
            </CardBody>
          </Card>
        )}

        <div className="mt-6 flex items-start gap-2 rounded-2xl border bg-ink-50/60 p-4 text-sm text-[var(--muted)] dark:bg-ink-800/50">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
          <p>
            24Asia is a migrant-led volunteer group. We publish how funds are used on
            our{" "}
            <Link href="/impact" className="font-medium text-brand-700 dark:text-brand-300 underline">
              impact page
            </Link>
            , and our policies are available{" "}
            <Link href="/policies" className="font-medium text-brand-700 dark:text-brand-300 underline">
              here
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Prefer to help another way?{" "}
          <Link href="/volunteer" className="font-medium text-brand-700 dark:text-brand-300 underline">
            Volunteer your time
          </Link>{" "}
          or{" "}
          <Link href="/about/partners" className="font-medium text-brand-700 dark:text-brand-300 underline">
            partner with us
          </Link>
          .
        </p>
      </Container>
    </Section>
  );
}
