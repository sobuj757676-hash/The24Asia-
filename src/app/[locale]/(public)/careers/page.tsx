import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { listPublishedListings } from "@/server/queries/support";
import { applyToListing } from "@/server/actions/career";

export const metadata = { title: "Career opportunities" };

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const listings = await listPublishedListings();
  const user = await getCurrentUser();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">Career & job opportunities</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">
          Verified opportunities from our partners. 24Asia never charges workers
          any fee.
        </p>
        {listings.length === 0 ? (
          <div className="mt-8"><EmptyState title="No opportunities right now" /></div>
        ) : (
          <div className="mt-8 space-y-4">
            {listings.map((l) => (
              <Card key={l.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    {l.verified && <Badge tone="success">Verified</Badge>}
                    {l.roleType && <Badge>{l.roleType}</Badge>}
                  </div>
                  <CardTitle className="mt-2">{l.title}</CardTitle>
                  {l.description && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{l.description}</p>
                  )}
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {l.compensation && <div><dt className="font-semibold">Compensation</dt><dd>{l.compensation}</dd></div>}
                    {l.eligibility && <div><dt className="font-semibold">Eligibility</dt><dd>{l.eligibility}</dd></div>}
                  </dl>
                  <p className="mt-2 text-xs text-[var(--muted)]">{l.feeDeclaration}</p>

                  <div className="mt-4">
                    {user ? (
                      <form action={applyToListing.bind(null, l.id)} className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" name="consentToShare" className="size-5" />
                          I consent to share my profile with this employer
                        </label>
                        <Button type="submit" size="sm">Apply</Button>
                      </form>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/sign-in?redirect=/careers`}>Sign in to apply</Link>
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
