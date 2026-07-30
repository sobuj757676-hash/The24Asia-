import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Badge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow } from "@/components/ui/form";
import { DataList, type Column } from "@/components/ui/data-list";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Building2,
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  ExternalLink,
  FileText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { myPartners, partnerListings, getPartnerAgreements } from "@/server/queries/ops";
import { submitPartnerListing } from "@/server/actions/ops";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Partner portal", robots: { index: false } };

type Listing = Awaited<ReturnType<typeof partnerListings>>[number];

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
    partners.map(async ({ partner, contact }) => {
      const [listings, agreements] = await Promise.all([
        partnerListings(partner.id),
        getPartnerAgreements(partner.id),
      ]);
      return { partner, contact, listings, agreements };
    }),
  );

  if (partners.length === 0) {
    return (
      <>
        <PageHeader
          title="Partner portal"
          description="Post ethical opportunities and manage your organisation's listings."
        />
        <EmptyState
          icon={<Building2 className="size-5" aria-hidden />}
          title="No partner organisation linked"
          description="Your account isn't linked to a partner organisation yet. Contact the 24Asia partnerships team and we'll connect you — then you can submit opportunities and manage listings here."
          action={
            <Button asChild size="sm">
              <Link href="/support">Contact partnerships team</Link>
            </Button>
          }
        />
      </>
    );
  }

  const columns = (locale: string): Column<Listing>[] => [
    {
      key: "title",
      label: "Role",
      primary: true,
      render: (l) => (
        <div className="min-w-0">
          <span className="font-medium">{l.title}</span>
          {l.compensation && (
            <span className="block text-xs text-[var(--muted)]">{l.compensation}</span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (l) => <span className="capitalize">{l.roleType ?? "job"}</span>,
    },
    {
      key: "created",
      label: "Submitted",
      render: (l) => formatDate(l.createdAt, locale),
    },
    {
      key: "expires",
      label: "Expires",
      hideOnMobile: true,
      render: (l) => (l.expiresAt ? formatDate(l.expiresAt, locale) : "—"),
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (l) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {l.verified && <Badge tone="info">Verified</Badge>}
          <StatusBadge status={l.published ? "published" : "under_review"} />
        </div>
      ),
    },
  ];

  const SOON = 1000 * 60 * 60 * 24 * 60; // 60 days

  return (
    <div className="space-y-12">
      {withListings.map(({ partner, contact, listings, agreements }) => {
        const published = listings.filter((l) => l.published);
        const inReview = listings.filter((l) => !l.published);
        const expiring = agreements.filter(
          (a) => a.expiryAt && new Date(a.expiryAt).getTime() - Date.now() < SOON,
        );

        return (
          <section key={partner.id}>
            <PageHeader
              title={partner.name}
              description={
                contact?.title
                  ? `You are listed as ${contact.title}${contact.isPrimary ? " (primary contact)" : ""}.`
                  : "Manage your organisation's opportunities and agreements."
              }
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {partner.verified ? (
                    <Badge tone="success">
                      <BadgeCheck className="size-3.5" aria-hidden />
                      Verified partner
                    </Badge>
                  ) : (
                    <Badge tone="warning">Verification pending</Badge>
                  )}
                  {partner.websiteUrl && (
                    <Button asChild size="sm" variant="outline">
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                        <ExternalLink className="size-3.5" aria-hidden />
                      </a>
                    </Button>
                  )}
                </div>
              }
            />

            {/* Ethical recruitment reminder (CAR-006) */}
            <Card className="mb-6 border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20">
              <CardBody className="flex items-start gap-3 py-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                <p className="text-sm">
                  <span className="font-semibold">Zero-fee commitment. </span>
                  Every listing published through 24Asia must be free for workers. We
                  never allow recruitment fees, salary deductions or document retention.
                  Listings are reviewed before going live.
                </p>
              </CardBody>
            </Card>

            {expiring.length > 0 && (
              <Card className="mb-6 border-amber-300 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-900/20">
                <CardBody className="flex items-start gap-3 py-4">
                  <TriangleAlert
                    className="mt-0.5 size-5 shrink-0 text-amber-600"
                    aria-hidden
                  />
                  <div className="text-sm">
                    <p className="font-semibold">Agreement renewal due</p>
                    <p className="text-[var(--muted)]">
                      {expiring
                        .map(
                          (a) =>
                            `${a.title} expires ${formatDate(a.expiryAt!, locale)}`,
                        )
                        .join(" · ")}
                      . Contact the partnerships team to renew.
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            <StatGrid cols={3}>
              <StatCard
                label="Published listings"
                value={published.length}
                icon={<BriefcaseBusiness className="size-4" />}
                tone="indigo"
              />
              <StatCard
                label="Under review"
                value={inReview.length}
                hint={inReview.length > 0 ? "Usually reviewed within 3 working days" : "Nothing pending"}
                icon={<Clock className="size-4" />}
                tone="indigo"
              />
              <StatCard
                label="Agreements on file"
                value={agreements.length}
                icon={<FileText className="size-4" />}
                tone="indigo"
              />
            </StatGrid>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FormCard
                  title="Submit an opportunity"
                  description="24Asia reviews every submission before publishing. We never charge workers any fee."
                  action={submitPartnerListing.bind(null, partner.id)}
                  submitLabel="Submit for review"
                  pendingLabel="Submitting…"
                >
                  <FormRow>
                    <Field label="Title" htmlFor={`title-${partner.id}`} required>
                      <Input
                        id={`title-${partner.id}`}
                        name="title"
                        placeholder="e.g. Warehouse assistant (day shift)"
                        required
                      />
                    </Field>
                  </FormRow>
                  <Field label="Role type" htmlFor={`roleType-${partner.id}`}>
                    <Select id={`roleType-${partner.id}`} name="roleType" defaultValue="job">
                      <option value="job">Job</option>
                      <option value="internship">Internship</option>
                      <option value="training">Training</option>
                    </Select>
                  </Field>
                  <Field
                    label="Compensation"
                    htmlFor={`compensation-${partner.id}`}
                    hint="Be specific — pay transparency builds trust."
                  >
                    <Input
                      id={`compensation-${partner.id}`}
                      name="compensation"
                      placeholder="e.g. S$1,600/month + overtime"
                    />
                  </Field>
                  <FormRow>
                    <Field
                      label="Description"
                      htmlFor={`description-${partner.id}`}
                      hint="Duties, working hours, location and what support is provided."
                    >
                      <Textarea
                        id={`description-${partner.id}`}
                        name="description"
                        rows={4}
                      />
                    </Field>
                  </FormRow>
                  <Field label="Eligibility" htmlFor={`eligibility-${partner.id}`}>
                    <Input
                      id={`eligibility-${partner.id}`}
                      name="eligibility"
                      placeholder="e.g. Valid work permit, basic English"
                    />
                  </Field>
                  <Field
                    label="Accountable contact"
                    htmlFor={`accountableContact-${partner.id}`}
                    hint="Who a worker can reach if something goes wrong."
                  >
                    <Input
                      id={`accountableContact-${partner.id}`}
                      name="accountableContact"
                      placeholder="Name · email or phone"
                    />
                  </Field>
                </FormCard>
              </div>

              <div>
                <SectionHeader title="Agreements" />
                {agreements.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<FileText className="size-5" aria-hidden />}
                    title="No agreements on file"
                    description="Signed MOUs and data-sharing agreements will be listed here."
                  />
                ) : (
                  <ul className="space-y-2">
                    {agreements.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-2xl border bg-[var(--card)] px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="min-w-0 text-sm font-medium">{a.title}</p>
                          <Badge>{a.type ?? "agreement"}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {a.effectiveAt
                            ? `Effective ${formatDate(a.effectiveAt, locale)}`
                            : "Effective date pending"}
                          {a.expiryAt ? ` · expires ${formatDate(a.expiryAt, locale)}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-8">
              <SectionHeader
                title="Your listings"
                description="Listings stay in review until our team verifies the terms."
              />
              {listings.length === 0 ? (
                <EmptyState
                  compact
                  icon={<BriefcaseBusiness className="size-5" aria-hidden />}
                  title="No listings yet"
                  description="Submit your first opportunity above — we'll review it and publish it to the 24Asia community."
                />
              ) : (
                <DataList
                  columns={columns(locale)}
                  rows={listings}
                  getKey={(l) => l.id}
                  caption={`Opportunity listings for ${partner.name}`}
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
