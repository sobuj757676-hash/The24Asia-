import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { CheckboxField } from "@/components/ui/form";
import { BriefcaseBusiness, ShieldCheck, TriangleAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listPublishedListings } from "@/server/queries/support";
import { applyToListing } from "@/server/actions/career";

export const metadata = { title: "Career opportunities" };

export default async function CareersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const listings = await listPublishedListings();
  const user = await getCurrentUser();

  return (
    <Section>
      <Container className="max-w-4xl">
        <PageIntro
          eyebrow={
            <Badge tone="success">
              <ShieldCheck className="size-3.5" aria-hidden />
              Zero-fee guarantee
            </Badge>
          }
          title="Career & job opportunities"
          description="Verified opportunities from our partner organisations. 24Asia never charges workers any fee, and we never share your details without your consent."
        />

        {/* Anti-exploitation warning (PRD CAR-006) */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">If anyone asks you for money, tell us.</p>
            <p className="text-[var(--muted)]">
              Legitimate employers never ask workers for recruitment fees, keep your
              passport, or deduct “agent” costs from your salary.{" "}
              <Link href="/support/urgent-help" className="font-medium underline">
                Report a concern
              </Link>
              .
            </p>
          </div>
        </div>

        {error === "consent_required" && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-800 dark:bg-red-900/20"
          >
            <p className="font-semibold">We couldn&apos;t send your application</p>
            <p className="text-[var(--muted)]">
              You need to tick the consent box so we know it&apos;s okay to share your
              details with the employer.
            </p>
          </div>
        )}

        {listings.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness className="size-5" aria-hidden />}
            title="No opportunities right now"
            description="We only publish roles once we've verified the employer and confirmed there are no fees. New listings appear here as soon as they pass review."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/learn">Build your skills meanwhile</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {listings.map((l) => (
              <Card key={l.id} id={`listing-${l.id}`} className="scroll-mt-20">
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    {l.verified && (
                      <Badge tone="success">
                        <ShieldCheck className="size-3.5" aria-hidden />
                        Verified
                      </Badge>
                    )}
                    {l.roleType && <Badge className="capitalize">{l.roleType}</Badge>}
                  </div>
                  <CardTitle className="mt-2.5">{l.title}</CardTitle>
                  {l.description && (
                    <p className="mt-1.5 text-sm text-[var(--muted)]">{l.description}</p>
                  )}
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    {l.compensation && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Compensation
                        </dt>
                        <dd className="mt-0.5">{l.compensation}</dd>
                      </div>
                    )}
                    {l.eligibility && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Eligibility
                        </dt>
                        <dd className="mt-0.5">{l.eligibility}</dd>
                      </div>
                    )}
                    {l.accountableContact && (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                          Who to contact
                        </dt>
                        <dd className="mt-0.5">{l.accountableContact}</dd>
                      </div>
                    )}
                  </dl>
                  {l.feeDeclaration && (
                    <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
                      {l.feeDeclaration}
                    </p>
                  )}

                  <div className="mt-4 border-t pt-4">
                    {user ? (
                      <form
                        action={applyToListing.bind(null, l.id)}
                        className="space-y-3"
                      >
                        <CheckboxField
                          id={`consent-${l.id}`}
                          name="consentToShare"
                          label="Share my profile with this employer"
                          description="Required to apply. We only share your name, contact details and any skills on your profile."
                        />
                        <SubmitButton size="sm" pendingLabel="Sending…">
                          Apply
                        </SubmitButton>
                      </form>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href="/sign-in?redirect=/careers">Sign in to apply</Link>
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
