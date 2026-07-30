import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Clock, CalendarDays, Award, Users, ArrowRight, FileCheck2,
  TriangleAlert, Receipt,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getMyVolunteerProfile,
  getMyHours,
  getMyShifts,
  getMyRecognition,
} from "@/server/queries/portal";
import { myExpenses } from "@/server/queries/ops";
import { formatDate } from "@/lib/utils";

export default async function VolunteerDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const [profile, hours, shifts, recognitions, expenses] = await Promise.all([
    getMyVolunteerProfile(user.personId),
    getMyHours(user.personId),
    getMyShifts(user.personId),
    getMyRecognition(user.personId),
    myExpenses(user.personId),
  ]);

  const approvedHours = hours
    .filter((h) => h.approved)
    .reduce((sum, h) => sum + Number(h.hours), 0);
  const pendingHours = hours.filter((h) => !h.approved).length;
  const upcoming = shifts
    .filter((s) => s.shift.startsAt && new Date(s.shift.startsAt) >= new Date() && s.shift.status !== "cancelled")
    .slice(0, 3);
  const pendingExpenses = expenses.filter((e) => e.status === "submitted").length;
  const firstName = (user.displayName || user.name || "there").split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={
          profile
            ? "Thank you for volunteering with 24Asia. Here's your activity at a glance."
            : "You're not an approved volunteer yet — browse opportunities to get started."
        }
        actions={
          profile ? (
            <Badge tone={profile.standing === "active" ? "success" : "info"}>
              {profile.standing === "active" ? "Active volunteer" : profile.standing}
            </Badge>
          ) : (
            <Button asChild size="sm">
              <Link href="/volunteer">
                Browse opportunities <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          )
        }
      />

      {/* Onboarding prompt */}
      {profile && !profile.handbookAcknowledgedAt && (
        <Card className="mb-6 border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold">Action needed: acknowledge the handbook</p>
                <p className="text-sm text-[var(--muted)]">
                  You need to accept the volunteer handbook and code of conduct before being
                  assigned to some roles.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="accent">
              <Link href="/volunteer-portal/profile">Review &amp; accept</Link>
            </Button>
          </CardBody>
        </Card>
      )}

      <StatGrid>
        <StatCard
          label="Approved hours"
          value={approvedHours}
          hint={pendingHours > 0 ? `${pendingHours} awaiting approval` : "All hours approved"}
          icon={<Clock className="size-4" />}
          tone="accent"
          href="/volunteer-portal/hours"
        />
        <StatCard
          label="Upcoming shifts"
          value={upcoming.length}
          icon={<CalendarDays className="size-4" />}
          tone="accent"
          href="/volunteer-portal/shifts"
        />
        <StatCard
          label="Recognition"
          value={recognitions.length}
          icon={<Award className="size-4" />}
          tone="accent"
          href="/volunteer-portal/profile"
        />
        <StatCard
          label="Team"
          value={profile?.team ?? "—"}
          icon={<Users className="size-4" />}
          tone="accent"
        />
      </StatGrid>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming shifts */}
        <section>
          <SectionHeader
            title="Your next shifts"
            actions={
              <Button asChild variant="ghost" size="sm">
                <Link href="/volunteer-portal/shifts">Find shifts</Link>
              </Button>
            }
          />
          {upcoming.length === 0 ? (
            <EmptyState
              compact
              icon={<CalendarDays className="size-5" aria-hidden />}
              title="No upcoming shifts"
              description="Sign up to help at an upcoming event."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/volunteer-portal/shifts">Browse available shifts</Link>
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2">
              {upcoming.map(({ shift, event }) => (
                <li key={shift.id}>
                  <Card>
                    <CardBody className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {event?.title ?? shift.role ?? "Shift"}
                        </p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {shift.role} ·{" "}
                          {shift.startsAt
                            ? formatDate(shift.startsAt, locale, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "Time to be confirmed"}
                        </p>
                      </div>
                      <StatusBadge status={shift.status} />
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <SectionHeader title="Quick actions" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/volunteer-portal/hours", label: "Log hours", icon: <Clock className="size-4" />, hint: "Record time you've given" },
              { href: "/volunteer-portal/expenses", label: "Claim expenses", icon: <Receipt className="size-4" />, hint: pendingExpenses > 0 ? `${pendingExpenses} pending` : "Transport, materials" },
              { href: "/volunteer-portal/applications", label: "My applications", icon: <FileCheck2 className="size-4" />, hint: "Track role requests" },
              { href: "/volunteer-portal/report", label: "Report a concern", icon: <TriangleAlert className="size-4" />, hint: "Confidential" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex items-start gap-3 rounded-2xl border bg-[var(--card)] p-4 shadow-sm transition-all hover:border-accent-400 hover:shadow-md"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
                  {a.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.label}</span>
                  <span className="block truncate text-xs text-[var(--muted)]">{a.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Recognition */}
      {recognitions.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Your recognition" description="Thank you for the difference you make." />
          <div className="flex flex-wrap gap-2">
            {recognitions.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-xl border bg-[var(--card)] px-4 py-2.5"
              >
                <Award className="size-4 shrink-0 text-accent-500" aria-hidden />
                <div>
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {r.kind} · {formatDate(r.awardedAt, locale)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
