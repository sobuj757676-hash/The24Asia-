import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Badge, StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { HeartHandshake, ShieldAlert } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { listOpportunitiesAll, getById } from "@/server/queries/admin";
import { saveOpportunity, deleteOpportunity } from "@/server/actions/manage";

const RISK_TONE = { low: "neutral", medium: "warning", high: "danger" } as const;

export default async function AdminOpportunities({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("opportunity:manage");
  const opps = await listOpportunitiesAll();
  const editing = await getById(opps, edit);

  const published = opps.filter((o) => o.published).length;

  return (
    <>
      <PageHeader
        title="Volunteer opportunities"
        description="Define each role clearly — purpose, duties, commitment and risk level — so volunteers know what they are signing up for."
        breadcrumb={
          <BackLink href="/admin/volunteers">Volunteers</BackLink>
        }
        actions={
          <span className="text-sm text-[var(--muted)]">
            {published} of {opps.length} published
          </span>
        }
      />

      <div className="space-y-6">
        <FormCard
          title={editing ? `Edit “${editing.title}”` : "New opportunity"}
          description="High-risk roles require training and a screening check before assignment."
          action={saveOpportunity}
          submitLabel={editing ? "Save changes" : "Create opportunity"}
          pendingLabel="Saving…"
          secondaryAction={
            editing ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/volunteers/opportunities">Cancel</Link>
              </Button>
            ) : undefined
          }
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.title} required />
          </Field>
          <Field
            label="Commitment"
            htmlFor="commitment"
            hint="e.g. 4 hrs/week for 3 months"
          >
            <Input
              id="commitment"
              name="commitment"
              defaultValue={editing?.commitment ?? ""}
            />
          </Field>
          <FormRow>
            <Field label="Purpose" htmlFor="purpose" hint="Why this role matters.">
              <Textarea
                id="purpose"
                name="purpose"
                rows={3}
                defaultValue={editing?.purpose ?? ""}
              />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Duties" htmlFor="duties" hint="What the volunteer will actually do.">
              <Textarea
                id="duties"
                name="duties"
                rows={3}
                defaultValue={editing?.duties ?? ""}
              />
            </Field>
          </FormRow>
          <Field label="Location" htmlFor="locationName">
            <Input
              id="locationName"
              name="locationName"
              defaultValue={editing?.locationName ?? ""}
            />
          </Field>
          <Field
            label="Risk level"
            htmlFor="riskLevel"
            hint="Higher risk roles need safeguarding checks."
          >
            <Select
              id="riskLevel"
              name="riskLevel"
              defaultValue={editing?.riskLevel ?? "low"}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
          <Field
            label="Skills required"
            htmlFor="skillsRequired"
            hint="Comma separated."
          >
            <Input
              id="skillsRequired"
              name="skillsRequired"
              defaultValue={(editing?.skillsRequired ?? []).join(", ")}
            />
          </Field>
          <Field label="Capacity" htmlFor="capacity" hint="Leave blank for unlimited.">
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              defaultValue={editing?.capacity ?? ""}
            />
          </Field>
          <FormRow className="space-y-2.5">
            <CheckboxField
              name="requiresTraining"
              label="Requires training"
              description="Volunteers must complete training before their first shift."
              defaultChecked={editing?.requiresTraining ?? false}
            />
            <CheckboxField
              name="published"
              label="Published"
              description="Visible on the public volunteer page and open for applications."
              defaultChecked={editing?.published ?? false}
            />
          </FormRow>
        </FormCard>

        <section>
          <SectionHeader title={`All opportunities (${opps.length})`} />
          {opps.length === 0 ? (
            <EmptyState
              compact
              icon={<HeartHandshake className="size-5" aria-hidden />}
              title="No opportunities yet"
              description="Create your first volunteer role above to start accepting applications."
            />
          ) : (
            <ul className="space-y-2">
              {opps.map((o) => (
                <li key={o.id}>
                  <Card
                    className={
                      editing?.id === o.id
                        ? "border-brand-400 ring-1 ring-brand-200"
                        : undefined
                    }
                  >
                    <CardBody className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{o.title}</h3>
                        <p className="text-sm text-[var(--muted)]">
                          {o.commitment || "Flexible commitment"}
                          {o.locationName ? ` · ${o.locationName}` : ""}
                          {o.capacity ? ` · ${o.capacity} places` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {o.requiresTraining && (
                          <Badge tone="info">Training required</Badge>
                        )}
                        <Badge tone={RISK_TONE[o.riskLevel]}>
                          {o.riskLevel === "low" ? null : (
                            <ShieldAlert className="size-3" aria-hidden />
                          )}
                          {o.riskLevel} risk
                        </Badge>
                        <StatusBadge status={o.published ? "published" : "draft"} />
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/volunteers/opportunities?edit=${o.id}`}>
                            Edit
                          </Link>
                        </Button>
                        <ActionButton
                          action={deleteOpportunity.bind(null, o.id)}
                          label="Delete"
                          variant="danger"
                          icon
                          confirm="Delete this opportunity? Existing applications will be detached."
                          successMessage="Deleted"
                        />
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
