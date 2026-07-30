import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionButton } from "@/components/admin/row-actions";
import { listAllListings, listMentorRequests } from "@/server/queries/support";
import { getById } from "@/server/queries/admin";
import { saveListing, deleteListing } from "@/server/actions/career";
import { formatDate } from "@/lib/utils";
import { Briefcase, ShieldCheck, HeartHandshake, Info } from "lucide-react";

export default async function AdminCareer({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("content:publish");

  const [listings, mentorReqs] = await Promise.all([
    listAllListings(),
    listMentorRequests(),
  ]);
  const editing = await getById(listings, edit);

  const published = listings.filter((l) => l.published).length;
  const unverified = listings.filter((l) => !l.verified).length;
  const openMatches = mentorReqs.filter((m) =>
    ["requested", "under_review"].includes(m.match.status),
  ).length;

  return (
    <>
      <PageHeader
        title="Career & mentorship"
        description="Verified employer opportunities and mentorship matching."
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm dark:border-amber-800 dark:bg-amber-900/20">
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
        <p>
          Only publish a listing after verifying the employer and confirming no fee is charged to
          workers. Every listing must name an accountable contact.
        </p>
      </div>

      <StatGrid>
        <StatCard label="Listings" value={listings.length} icon={<Briefcase className="size-4" />} />
        <StatCard label="Published" value={published} icon={<Briefcase className="size-4" />} />
        <StatCard
          label="Unverified"
          value={unverified}
          icon={<ShieldCheck className="size-4" />}
          tone={unverified > 0 ? "accent" : "neutral"}
        />
        <StatCard
          label="Mentorship requests"
          value={openMatches}
          icon={<HeartHandshake className="size-4" />}
          tone={openMatches > 0 ? "accent" : "neutral"}
        />
      </StatGrid>

      <div className="mt-8">
        <FormCard
          title={editing ? `Edit “${editing.title}”` : "New opportunity listing"}
          action={saveListing}
          submitLabel={editing ? "Save changes" : "Create listing"}
          secondaryAction={
            editing ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/career">Cancel</Link>
              </Button>
            ) : null
          }
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.title} required />
          </Field>
          <Field label="Role type" htmlFor="roleType">
            <Select id="roleType" name="roleType" defaultValue={editing?.roleType ?? "job"}>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
              <option value="training">Training</option>
            </Select>
          </Field>
          <FormRow>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
            </Field>
          </FormRow>
          <Field label="Compensation" htmlFor="compensation">
            <Input id="compensation" name="compensation" defaultValue={editing?.compensation ?? ""} />
          </Field>
          <Field label="Eligibility" htmlFor="eligibility">
            <Input id="eligibility" name="eligibility" defaultValue={editing?.eligibility ?? ""} />
          </Field>
          <FormRow>
            <Field
              label="Accountable contact"
              htmlFor="accountableContact"
              hint="A named person at the employer who is responsible for this listing"
            >
              <Input
                id="accountableContact"
                name="accountableContact"
                defaultValue={editing?.accountableContact ?? ""}
              />
            </Field>
          </FormRow>
          <CheckboxField
            name="verified"
            label="Employer verified"
            description="Due diligence completed"
            defaultChecked={editing?.verified ?? false}
          />
          <CheckboxField
            name="published"
            label="Published"
            description="Visible on the public careers page"
            defaultChecked={editing?.published ?? false}
          />
        </FormCard>
      </div>

      <section className="mt-8">
        <SectionHeader title={`Listings (${listings.length})`} />
        {listings.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="size-5" aria-hidden />}
            title="No listings yet"
            description="Add verified opportunities from partner employers."
          />
        ) : (
          <ul className="space-y-2">
            {listings.map((l) => (
              <li key={l.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {l.title}
                        {l.verified ? (
                          <Badge tone="success">Verified</Badge>
                        ) : (
                          <Badge tone="warning">Unverified</Badge>
                        )}
                        <Badge tone={l.published ? "info" : "neutral"}>
                          {l.published ? "Published" : "Draft"}
                        </Badge>
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {l.roleType ?? "role"}
                        {l.compensation ? ` · ${l.compensation}` : ""}
                      </p>
                    </div>
                    <span className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/career?edit=${l.id}`}>Edit</Link>
                      </Button>
                      <ActionButton
                        action={deleteListing.bind(null, l.id)}
                        label="Delete"
                        variant="danger"
                        icon
                        confirmTitle={`Delete “${l.title}”?`}
                        confirm="This listing and its applications will be removed. This cannot be undone."
                        successMessage="Listing deleted"
                      />
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader
          title={`Mentorship requests (${mentorReqs.length})`}
          description="Match a mentor once you've checked suitability."
        />
        {mentorReqs.length === 0 ? (
          <EmptyState
            compact
            icon={<HeartHandshake className="size-5" aria-hidden />}
            title="No mentorship requests"
            description="Members can request a mentor from their account area."
          />
        ) : (
          <ul className="space-y-2">
            {mentorReqs.map(({ match, menteeName }) => (
              <li key={match.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{menteeName ?? "Member"}</p>
                      <p className="truncate text-sm text-[var(--muted)]">
                        {match.topic ?? "General mentorship"} ·{" "}
                        {formatDate(match.createdAt, locale, { dateStyle: "medium" })}
                      </p>
                    </div>
                    <StatusBadge status={match.status} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
