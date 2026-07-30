import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard } from "@/components/ui/form";
import { Field, Input, Select } from "@/components/ui/input";
import { VolunteerReviewButtons } from "@/components/admin/review-buttons";
import {
  getPendingVolunteerApplications,
  listActiveVolunteers,
  listPendingHours,
} from "@/server/queries/admin";
import { listAllExpenses } from "@/server/queries/ops";
import { awardRecognition } from "@/server/actions/attendance";
import { formatDate } from "@/lib/utils";
import { HandHeart, Clock, Receipt, Award, Briefcase, CheckCircle2 } from "lucide-react";

export default async function AdminVolunteers({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("volunteer:review");

  const [pending, volunteers, pendingHours, expenses] = await Promise.all([
    getPendingVolunteerApplications(),
    listActiveVolunteers(),
    listPendingHours(),
    listAllExpenses(),
  ]);

  const activeCount = volunteers.filter((v) => v.standing === "active").length;
  const pendingExpenses = expenses.filter((e) => e.claim.status === "submitted").length;

  return (
    <>
      <PageHeader
        title="Volunteers"
        description="Review applications, approve hours and recognise the people who power our programs."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/volunteers/opportunities">
                <Briefcase className="size-4" aria-hidden /> Opportunities
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/volunteers/hours">
                <Clock className="size-4" aria-hidden /> Hours
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/volunteers/expenses">
                <Receipt className="size-4" aria-hidden /> Expenses
              </Link>
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Active volunteers" value={activeCount} icon={<HandHeart className="size-4" />} />
        <StatCard
          label="Applications to review"
          value={pending.length}
          icon={<CheckCircle2 className="size-4" />}
          tone={pending.length > 0 ? "accent" : "neutral"}
        />
        <StatCard
          label="Hours awaiting approval"
          value={pendingHours.length}
          icon={<Clock className="size-4" />}
          href="/admin/volunteers/hours"
          tone={pendingHours.length > 0 ? "accent" : "neutral"}
        />
        <StatCard
          label="Expense claims"
          value={pendingExpenses}
          icon={<Receipt className="size-4" />}
          href="/admin/volunteers/expenses"
          tone={pendingExpenses > 0 ? "accent" : "neutral"}
        />
      </StatGrid>

      <section className="mt-8">
        <SectionHeader
          title={`Applications to review (${pending.length})`}
          description="Decisions are recorded against your name and the applicant is notified."
        />
        {pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            title="No applications waiting"
            description="New volunteer applications will appear here for review."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map(({ application, person, opportunity }) => (
              <li key={application.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {person.displayName ?? "Applicant"}
                        <StatusBadge status={application.status} />
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {opportunity?.title ?? "General application"} ·{" "}
                        {formatDate(application.createdAt, locale, { dateStyle: "medium" })}
                        {opportunity?.riskLevel ? ` · ${opportunity.riskLevel} risk` : ""}
                      </p>
                      {application.motivation && (
                        <p className="mt-2 max-w-prose rounded-xl bg-ink-50 p-3 text-sm dark:bg-ink-800/60">
                          “{application.motivation}”
                        </p>
                      )}
                    </div>
                    <VolunteerReviewButtons id={application.id} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader
          title="Recognise a volunteer"
          description="Recognition appears on the volunteer's profile and sends them a notification."
        />
        {volunteers.length === 0 ? (
          <EmptyState
            compact
            icon={<Award className="size-5" aria-hidden />}
            title="No volunteers yet"
            description="Approve a volunteer application to get started."
          />
        ) : (
          <FormCard
            action={awardRecognition}
            submitLabel="Award recognition"
            pendingLabel="Awarding…"
            columns={3}
          >
            <Field label="Volunteer" htmlFor="personId" required>
              <Select id="personId" name="personId" required>
                {volunteers.map((v) => (
                  <option key={v.personId} value={v.personId}>
                    {v.name ?? "Volunteer"} ({v.standing})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Kind" htmlFor="kind">
              <Select id="kind" name="kind" defaultValue="appreciation">
                <option value="appreciation">Appreciation</option>
                <option value="milestone">Milestone</option>
                <option value="badge">Badge</option>
              </Select>
            </Field>
            <Field label="Label" htmlFor="label" required hint="e.g. 100 hours served">
              <Input id="label" name="label" required />
            </Field>
          </FormCard>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader title={`Volunteer register (${volunteers.length})`} />
        {volunteers.length === 0 ? (
          <EmptyState compact title="No volunteers on the register yet" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {volunteers.map((v) => (
              <span
                key={v.personId}
                className="inline-flex items-center gap-2 rounded-xl border bg-[var(--card)] px-3 py-2 text-sm"
              >
                {v.name ?? "Volunteer"}
                <Badge tone={v.standing === "active" ? "success" : "info"}>{v.standing}</Badge>
              </span>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
