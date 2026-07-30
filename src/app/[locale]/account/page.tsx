import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Award, CalendarDays, ClipboardList, ArrowRight,
  GraduationCap, Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getMyEnrollments,
  getMyApplications,
  getMyEventRegistrations,
  getRecommendedCourses,
  getMyCertificates,
} from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

export default async function AccountDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const [enrollments, applications, events, recommended, certificates] =
    await Promise.all([
      getMyEnrollments(user.personId),
      getMyApplications(user.personId),
      getMyEventRegistrations(user.personId),
      getRecommendedCourses(user.personId),
      getMyCertificates(user.personId),
    ]);

  const active = enrollments.filter((e) =>
    ["enrolled", "offered"].includes(e.enrollment.status),
  );
  const completed = enrollments.filter((e) => e.enrollment.status === "completed");
  const pendingApps = applications.filter((a) =>
    ["submitted", "under_review", "waitlisted", "more_information"].includes(
      a.application.status,
    ),
  );
  const upcomingEvents = events
    .filter((e) => new Date(e.event.startsAt) >= new Date() && e.registration.status !== "cancelled")
    .slice(0, 3);
  const firstName = (user.displayName || user.name || "there").split(" ")[0];
  const isNew = enrollments.length === 0 && applications.length === 0;

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={
          isNew
            ? "Welcome to 24Asia. All our training is free — pick a course to get started."
            : "Here's your learning at a glance."
        }
        actions={
          <Button asChild size="sm" variant={isNew ? "primary" : "outline"}>
            <Link href="/learn">
              Browse courses <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      {isNew ? (
        <EmptyState
          icon={<GraduationCap className="size-5" aria-hidden />}
          title="Start your first free course"
          description="Choose from digital skills, workplace safety, communication and more. Every course is free for migrant workers."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <Link href="/learn">Explore courses</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/learn/how-it-works">How it works</Link>
              </Button>
            </div>
          }
        />
      ) : (
        <StatGrid>
          <StatCard
            label="Active courses"
            value={active.length}
            icon={<BookOpen className="size-4" />}
            href="/account/courses"
          />
          <StatCard
            label="Completed"
            value={completed.length}
            icon={<GraduationCap className="size-4" />}
            href="/account/courses"
          />
          <StatCard
            label="Certificates"
            value={certificates.length}
            icon={<Award className="size-4" />}
            href="/account/certificates"
          />
          <StatCard
            label="Applications"
            value={pendingApps.length}
            hint={pendingApps.length > 0 ? "Awaiting a decision" : "None pending"}
            icon={<ClipboardList className="size-4" />}
          />
        </StatGrid>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Current learning */}
        {active.length > 0 && (
          <section>
            <SectionHeader
              title="Continue learning"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/account/courses">All courses</Link>
                </Button>
              }
            />
            <ul className="space-y-2">
              {active.map(({ enrollment, course, cohort }) => (
                <li key={enrollment.id}>
                  <Card>
                    <CardBody className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{course.title}</p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {cohort.code}
                          {cohort.startDate ? ` · starts ${formatDate(cohort.startDate, locale)}` : ""}
                          {cohort.locationName ? ` · ${cohort.locationName}` : ""}
                        </p>
                      </div>
                      <StatusBadge status={enrollment.status} />
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Applications */}
        {pendingApps.length > 0 && (
          <section>
            <SectionHeader title="Your applications" />
            <ul className="space-y-2">
              {pendingApps.map(({ application, course, cohort }) => (
                <li key={application.id}>
                  <Card>
                    <CardBody className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{course.title}</p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {cohort.code} · applied {formatDate(application.createdAt, locale)}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <section>
            <SectionHeader
              title="Upcoming events"
              actions={
                <Button asChild variant="ghost" size="sm">
                  <Link href="/account/events">All events</Link>
                </Button>
              }
            />
            <ul className="space-y-2">
              {upcomingEvents.map(({ registration, event }) => (
                <li key={registration.id}>
                  <Card>
                    <CardBody className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{event.title}</p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          <CalendarDays className="mr-1 inline size-3" aria-hidden />
                          {formatDate(event.startsAt, locale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="mt-8">
          <SectionHeader
            title="Recommended for you"
            description="Free courses you haven't taken yet."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <Card key={c.id} className="transition-shadow hover:shadow-md">
                <CardBody>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700">
                    <Sparkles className="size-3.5" aria-hidden /> Free
                  </span>
                  <CardTitle className="mt-1.5 text-base">{c.title}</CardTitle>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{c.summary}</p>
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href={`/learn/${c.slug}`}>View course</Link>
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
