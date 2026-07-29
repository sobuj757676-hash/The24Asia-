import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { myPartners, partnerListings, getPartnerAgreements } from "@/server/queries/ops";
import { submitPartnerListing } from "@/server/actions/ops";

export const metadata = { title: "Partner portal", robots: { index: false } };

export default async function PartnerPortal({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect=/partner-portal");

  const partners = await myPartners(user.personId);
  const withListings = await Promise.all(
    partners.map(async ({ partner }) => ({
      partner,
      listings: await partnerListings(partner.id),
      agreements: await getPartnerAgreements(partner.id),
    })),
  );

  return (
    <div className="max-w-3xl">
      {partners.length === 0 ? (
        <EmptyState
          title="No partner organization linked"
          body="Ask 24Asia to link your account to your organization, then you can submit opportunities and manage your listings here."
        />
      ) : (
        <div className="space-y-8">
              {withListings.map(({ partner, listings, agreements }) => {
                return (
                  <div key={partner.id}>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-extrabold">{partner.name}</h1>
                      {partner.verified && <Badge tone="success">Verified</Badge>}
                    </div>
                    {partner.websiteUrl && (
                      <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-700">
                        {partner.websiteUrl}
                      </a>
                    )}

                    {agreements.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold">Agreements</h3>
                        <ul className="mt-2 space-y-1 text-sm">
                          {agreements.map((a) => (
                            <li key={a.id} className="flex items-center justify-between rounded-lg border bg-[var(--card)] px-3 py-2">
                              <span>{a.title}</span>
                              <Badge>{a.type ?? "agreement"}</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Card className="mt-4">
                      <CardBody>
                        <h2 className="mb-3 font-semibold">Submit an opportunity</h2>
                        <p className="mb-3 text-sm text-[var(--muted)]">
                          Submissions are reviewed by 24Asia before publishing. We
                          never charge workers any fee.
                        </p>
                        <form action={submitPartnerListing.bind(null, partner.id)} className="grid gap-3 sm:grid-cols-2">
                          <Field label="Title" htmlFor="title"><Input id="title" name="title" required /></Field>
                          <Field label="Role type" htmlFor="roleType">
                            <Select id="roleType" name="roleType" defaultValue="job">
                              <option value="job">Job</option>
                              <option value="internship">Internship</option>
                              <option value="training">Training</option>
                            </Select>
                          </Field>
                          <div className="sm:col-span-2"><Field label="Description" htmlFor="description"><Textarea id="description" name="description" /></Field></div>
                          <Field label="Compensation" htmlFor="compensation"><Input id="compensation" name="compensation" /></Field>
                          <Field label="Eligibility" htmlFor="eligibility"><Input id="eligibility" name="eligibility" /></Field>
                          <div className="sm:col-span-2"><Button type="submit" size="sm">Submit for review</Button></div>
                        </form>
                      </CardBody>
                    </Card>

                    <h3 className="mt-6 font-semibold">Your listings</h3>
                    <div className="mt-2 space-y-2">
                      {listings.length === 0 ? (
                        <p className="text-sm text-[var(--muted)]">No listings yet.</p>
                      ) : (
                        listings.map((l) => (
                          <Card key={l.id}>
                            <CardBody className="flex items-center justify-between gap-3">
                              <CardTitle className="text-base">{l.title}</CardTitle>
                              <Badge tone={l.published ? "success" : "neutral"}>
                                {l.published ? "Published" : "Under review"}
                              </Badge>
                            </CardBody>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
    </div>
  );
}
