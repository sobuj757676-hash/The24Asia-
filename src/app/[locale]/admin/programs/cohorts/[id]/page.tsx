import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{detail.course.title}</h1>
          <p className="text-[var(--muted)]">
            {detail.cohort.code} · {detail.cohort.locationName}
          </p>
        </div>
        <Link href="/admin/programs" className="text-sm text-brand-700">← Programs</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions */}
        <Card>
          <CardBody>
            <CardTitle className="text-base">Sessions</CardTitle>
            <ul className="mt-3 space-y-1">
              {detail.sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/programs/cohorts/${id}?session=${s.id}`}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${session === s.id ? "border-brand-600" : ""}`}
                  >
                    <span>#{s.sequence} {s.title}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(s.startsAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </Link>
                </li>
              ))}
              {detail.sessions.length === 0 && (
                <li className="text-sm text-[var(--muted)]">No sessions yet.</li>
              )}
            </ul>

            <form action={addCohortSession} className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
              <input type="hidden" name="cohortId" value={id} />
              <Field label="Sequence" htmlFor="sequence"><Input id="sequence" name="sequence" type="number" defaultValue={detail.sessions.length + 1} /></Field>
              <Field label="Title" htmlFor="title"><Input id="title" name="title" placeholder="Session title" /></Field>
              <div className="sm:col-span-2">
                <Field label="Starts at" htmlFor="startsAt"><Input id="startsAt" name="startsAt" type="datetime-local" required /></Field>
              </div>
              <div className="sm:col-span-2"><Button type="submit" size="sm">Add session</Button></div>
            </form>
          </CardBody>
        </Card>

        {/* Roster / attendance */}
        <Card>
          <CardBody>
            <CardTitle className="text-base">
              {roster ? `Attendance — ${roster.session.title ?? "Session"}` : "Attendance"}
            </CardTitle>
            {!roster ? (
              <p className="mt-2 text-sm text-[var(--muted)]">Select a session to mark attendance.</p>
            ) : roster.roster.length === 0 ? (
              <EmptyState title="No enrolled learners" />
            ) : (
              <ul className="mt-3 space-y-2">
                {roster.roster.map((r) => (
                  <li key={r.personId} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <span className="text-sm font-medium">{r.name ?? "Learner"}</span>
                    <div className="flex items-center gap-2">
                      <Badge tone={r.status === "present" ? "success" : r.status === "no_show" ? "danger" : "neutral"}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                      <AttendanceControls sessionId={roster.session.id} personId={r.personId} current={r.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
