import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { getReportMetrics } from "@/server/queries/admin";

export default async function AdminReports({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("audit:read");
  const m = await getReportMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">Reports & impact</h1>
        <p className="text-[var(--muted)]">
          Operational metrics from live records. Public impact figures are
          managed separately with definitions & sources (PRD §25–26).
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Learning funnel</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(m.programs.apps)} label="Applications" />
          <Stat value={String(m.programs.approvedApps)} label="Approved" />
          <Stat value={String(m.programs.enrolled)} label="Enrolled" />
          <Stat value={String(m.programs.completed)} label="Completed" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Attendance</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat value={`${m.attendance.rate}%`} label="Attendance rate" />
          <Stat value={String(m.attendance.present)} label="Present marks" />
          <Stat value={String(m.attendance.totalMarks)} label="Total marks" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Volunteers</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat value={String(m.volunteers.volApps)} label="Applications" />
          <Stat value={String(m.volunteers.activeVols)} label="Active volunteers" />
          <Stat value={String(m.volunteers.approvedHours)} label="Approved hours" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Fundraising & content</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={`S$${(m.donations.donatedCents / 100).toFixed(0)}`} label="Donations" />
          <Stat value={String(m.donations.donationCount)} label="Gifts" />
          <Stat value={String(m.content.publishedCourses)} label="Published courses" />
          <Stat value={String(m.content.publishedContent)} label="Published content" />
        </div>
      </section>

      <Card>
        <CardBody>
          <CardTitle className="text-base">Note</CardTitle>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Cohort/nationality comparisons and equity breakdowns are intentionally
            omitted to avoid stigmatising groups (PRD REP-007). Small cohorts are
            suppressed in any published breakdown.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
