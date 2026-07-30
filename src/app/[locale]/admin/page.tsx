import { setRequestLocale } from "next-intl/server";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Users, GraduationCap, HandHeart, CalendarDays, ClipboardList,
  LifeBuoy, MessagesSquare, Receipt, ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import {
  getAdminKpis,
  getPendingApplications,
  getPendingVolunteerApplications,
  getReportMetrics,
} from "@/server/queries/admin";
import { listSupportQueue } from "@/server/queries/support";
import { moderationQueue } from "@/server/queries/community";
import { listAllExpenses } from "@/server/queries/ops";
import { formatDate } from "@/lib/utils";

// Chart is client-only and lazily loaded to keep the dashboard payload small.
const FunnelChart = dynamic(() =>
  import("@/components/admin/funnel-chart").then((m) => m.FunnelChart),
);

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  const roles = user?.roles ?? [];

  // Queues are only fetched when the viewer may act on them (permission-scoped
  // and avoids needless queries).
  const [kpis, metrics, courseApps, volApps, support, moderation, expenses] =
    await Promise.all([
      getAdminKpis(),
      getReportMetrics(),
      can(roles, "application:review") ? getPendingApplications() : Promise.resolve([]),
      can(roles, "volunteer:review") ? getPendingVolunteerApplications() : Promise.resolve([]),
      can(roles, "support:handle") ? listSupportQueue() : Promise.resolve([]),
      can(roles, "moderation:handle")
        ? moderationQueue()
        : Promise.resolve({ reports: [], pendingPosts: [] }),
      can(roles, "volunteer:hours_approve") ? listAllExpenses() : Promise.resolve([]),
    ]);

  const openSupport = support.filter(
    (s) => !["completed", "unmet_need", "withdrawn"].includes(s.req.status),
  ).length;
  const pendingExpenses = expenses.filter((e) => e.claim.status === "submitted").length;
  const moderationCount = moderation.reports.length + moderation.pendingPosts.length;

  const funnel = [
    { stage: "Applied", value: metrics.programs.apps },
    { stage: "Approved", value: metrics.programs.approvedApps },
    { stage: "Enrolled", value: metrics.programs.enrolled },
    { stage: "Completed", value: metrics.programs.completed },
  ];

  const queues = [
    {
      show: can(roles, "application:review"),
      label: "Course applications",
      count: courseApps.length,
      href: "/admin/programs",
      icon: <ClipboardList className="size-4" />,
    },
    {
      show: can(roles, "volunteer:review"),
      label: "Volunteer applications",
      count: volApps.length,
      href: "/admin/volunteers",
      icon: <HandHeart className="size-4" />,
    },
    {
      show: can(roles, "support:handle"),
      label: "Open support requests",
      count: openSupport,
      href: "/admin/support",
      icon: <LifeBuoy className="size-4" />,
    },
    {
      show: can(roles, "moderation:handle"),
      label: "Awaiting moderation",
      count: moderationCount,
      href: "/admin/community",
      icon: <MessagesSquare className="size-4" />,
    },
    {
      show: can(roles, "volunteer:hours_approve"),
      label: "Expense claims to review",
      count: pendingExpenses,
      href: "/admin/volunteers/expenses",
      icon: <Receipt className="size-4" />,
    },
  ].filter((q) => q.show);

  const totalActions = queues.reduce((n, q) => n + q.count, 0);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${(user?.displayName || user?.name || "there").split(" ")[0]}`}
        description={
          totalActions > 0
            ? `You have ${totalActions} item${totalActions === 1 ? "" : "s"} waiting for review.`
            : "Everything is up to date. Nothing is waiting for review."
        }
        actions={
          can(roles, "audit:read") ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/reports">
                View reports <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : null
        }
      />

      <StatGrid>
        <StatCard
          label="People"
          value={kpis.people}
          icon={<Users className="size-4" />}
          href={can(roles, "person:read_scoped") ? "/admin/people" : undefined}
        />
        <StatCard
          label="Active enrolments"
          value={kpis.activeEnrollments}
          icon={<GraduationCap className="size-4" />}
          href={can(roles, "course:manage") ? "/admin/programs" : undefined}
        />
        <StatCard
          label="Active volunteers"
          value={metrics.volunteers.activeVols}
          icon={<HandHeart className="size-4" />}
          href={can(roles, "volunteer:review") ? "/admin/volunteers" : undefined}
        />
        <StatCard
          label="Upcoming events"
          value={kpis.upcomingEvents}
          icon={<CalendarDays className="size-4" />}
          href={can(roles, "event:manage") ? "/admin/events" : undefined}
        />
      </StatGrid>

      {/* Action queues */}
      <section className="mt-8">
        <SectionHeader
          title="Needs your attention"
          description="Queues you have permission to action."
        />
        {queues.length === 0 ? (
          <EmptyState
            compact
            title="No queues assigned to your role"
            description="Your role doesn't own any review queues."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {queues.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border bg-[var(--card)] p-4 shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                    {q.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{q.label}</span>
                    <span className="text-xs text-[var(--muted)]">
                      {q.count === 0 ? "All clear" : "Needs review"}
                    </span>
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums ${
                    q.count > 0
                      ? "bg-accent-500/15 text-accent-600"
                      : "bg-ink-100 text-ink-500 dark:bg-ink-800"
                  }`}
                >
                  {q.count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Funnel + recent */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardBody>
            <SectionHeader
              title="Learning funnel"
              description={`Attendance rate ${metrics.attendance.rate}%`}
            />
            <FunnelChart data={funnel} />
            {/* Accessible equivalent of the chart */}
            <table className="mt-2 w-full text-sm">
              <caption className="sr-only">Learning funnel counts by stage</caption>
              <tbody>
                {funnel.map((f) => (
                  <tr key={f.stage} className="border-t">
                    <th scope="row" className="py-1.5 text-left font-medium">{f.stage}</th>
                    <td className="py-1.5 text-right tabular-nums">{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <SectionHeader title="Latest applications" />
            {courseApps.length === 0 ? (
              <EmptyState
                compact
                title="No pending applications"
                description="New course applications will appear here."
              />
            ) : (
              <ul className="divide-y">
                {courseApps.slice(0, 5).map(({ application, person, course }) => (
                  <li key={application.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {person.displayName ?? "Applicant"}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {course.title} · {formatDate(application.createdAt, locale)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </li>
                ))}
              </ul>
            )}
            {courseApps.length > 5 && (
              <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                <Link href="/admin/programs">View all {courseApps.length}</Link>
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
