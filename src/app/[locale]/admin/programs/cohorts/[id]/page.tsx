import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormGrid, FormRow } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { CalendarDays, Users, UserCheck } from "lucide-react";
import { AttendanceControls } from "@/components/admin/attendance-controls";
import { getCohortDetail, getSessionRoster } from "@/server/queries/learning";
import { addCohortSession } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";

export default async function CohortDetail({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { locale, id } = await params;
  const { session } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("cohort:manage");

  const detail = await getCohortDetail(id);
  if (!detail) notFound();
  const roster = session ? await getSessionRoster(session) : null;

  const presentCount =
    roster?.roster.filter((r) => r.status === "present").length ?? 0;

  return (
    <>
      <PageHeader
        title={detail.course.title}
        description={[detail.cohort.code, detail.cohort.locationName]
          .filter(Boolean)
          .join(" · ")}
        breadcrumb={
          <BackLink href="/admin/programs">Programs</BackLink>
        }
        actions={<StatusBadge status={detail.cohort.status} />}
      />

      <StatGrid cols={3}>
        <StatCard
          label="Sessions"
          value={detail.sessions.length}
          icon={<CalendarDays className="size-4" />}
        />
        <StatCard
          label="Capacity"
          value={detail.cohort.capacity ?? "—"}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label={roster ? "Present this session" : "Select a session"}
          value={roster ? presentCount : "—"}
          hint={roster ? `of ${roster.roster.length} enrolled` : "to mark attendance"}
          icon={<UserCheck className="size-4" />}
          tone="neutral"
        />
      </StatGrid>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Sessions */}
        <section>
          <SectionHeader
            title="Sessions"
            description="Choose a session to take attendance."
          />
          {detail.sessions.length === 0 ? (
            <EmptyState
              compact
              icon={<CalendarDays className="size-5" aria-hidden />}
              title="No sessions scheduled"
              description="Add the first session below so learners can see the timetable."
            />
          ) : (
            <ul className="space-y-1.5">
              {detail.sessions.map((s) => {
                const active = session === s.id;
                return (
                  <li key={s.id}>
                    <Link
                      href={`/admin/programs/cohorts/${id}?session=${s.id}`}
                      aria-current={active ? "true" : undefined}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-[var(--card)] px-3 py-2.5 text-sm transition-colors hover:border-brand-400 ${
                        active ? "border-brand-500 ring-1 ring-brand-200" : ""
                      }`}
                    >
                      <span className="font-medium">
                        <span className="mr-1.5 text-[var(--muted)]">#{s.sequence}</span>
                        {s.title ?? "Session"}
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {formatDate(s.startsAt, locale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Card className="mt-4">
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold">Add a session</h3>
              <form action={addCohortSession} className="space-y-4">
                <input type="hidden" name="cohortId" value={id} />
                <FormGrid columns={2}>
                  <Field label="Sequence" htmlFor="sequence">
                    <Input
                      id="sequence"
                      name="sequence"
                      type="number"
                      min="1"
                      defaultValue={detail.sessions.length + 1}
                    />
                  </Field>
                  <Field label="Title" htmlFor="title">
                    <Input id="title" name="title" placeholder="Session title" />
                  </Field>
                  <FormRow>
                    <Field label="Starts at" htmlFor="startsAt" required>
                      <Input
                        id="startsAt"
                        name="startsAt"
                        type="datetime-local"
                        required
                      />
                    </Field>
                  </FormRow>
                </FormGrid>
                <SubmitButton size="sm" pendingLabel="Adding…">
                  Add session
                </SubmitButton>
              </form>
            </CardBody>
          </Card>
        </section>

        {/* Roster / attendance */}
        <section>
          <SectionHeader
            title={roster ? `Attendance — ${roster.session.title ?? "Session"}` : "Attendance"}
            description={
              roster
                ? formatDate(roster.session.startsAt, locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : undefined
            }
          />
          {!roster ? (
            <EmptyState
              compact
              icon={<UserCheck className="size-5" aria-hidden />}
              title="No session selected"
              description="Pick a session from the list to mark who attended."
            />
          ) : roster.roster.length === 0 ? (
            <EmptyState
              compact
              icon={<Users className="size-5" aria-hidden />}
              title="No enrolled learners"
              description="Enrol learners into this cohort before taking attendance."
            />
          ) : (
            <ul className="space-y-2">
              {roster.roster.map((r) => (
                <li
                  key={r.personId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-[var(--card)] px-3 py-2.5"
                >
                  <span className="text-sm font-medium">{r.name ?? "Learner"}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <AttendanceControls
                      sessionId={roster.session.id}
                      personId={r.personId}
                      current={r.status}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
