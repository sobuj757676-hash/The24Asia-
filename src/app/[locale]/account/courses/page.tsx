import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyEnrollments } from "@/server/queries/portal";
import { withdrawEnrollment } from "@/server/actions/learner";
import { formatDate } from "@/lib/utils";
import { BookOpen, MapPin, CalendarDays, GraduationCap } from "lucide-react";

const ACTIVE = ["enrolled", "offered", "transfer_pending"];

export default async function MyCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const enrollments = await getMyEnrollments(user.personId);

  const active = enrollments.filter((e) => ACTIVE.includes(e.enrollment.status));
  const past = enrollments.filter((e) => !ACTIVE.includes(e.enrollment.status));

  function CourseCard({
    row,
    withdrawable,
  }: {
    row: (typeof enrollments)[number];
    withdrawable: boolean;
  }) {
    const { enrollment, course, cohort } = row;
    return (
      <Card>
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {course.title}
              <StatusBadge status={enrollment.status} />
            </p>
            <dl className="mt-2 space-y-1 text-sm text-[var(--muted)]">
              <div className="flex items-center gap-1.5">
                <Badge>{cohort.code}</Badge>
                {cohort.deliveryMode && <Badge>{cohort.deliveryMode.replace(/_/g, " ")}</Badge>}
              </div>
              {cohort.startDate && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                  <span>
                    {formatDate(cohort.startDate, locale, { dateStyle: "medium" })}
                    {cohort.endDate
                      ? ` – ${formatDate(cohort.endDate, locale, { dateStyle: "medium" })}`
                      : ""}
                  </span>
                </div>
              )}
              {cohort.locationName && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  <span>{cohort.locationName}</span>
                </div>
              )}
            </dl>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/account/attendance">Attendance</Link>
            </Button>
            {withdrawable && (
              <ActionButton
                action={withdrawEnrollment.bind(null, enrollment.id)}
                label="Withdraw"
                variant="ghost"
                confirmTitle={`Withdraw from ${course.title}?`}
                confirm="Your seat will be released to someone on the waitlist. You can apply again to a future batch."
                successMessage="You have withdrawn from this course"
              />
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={t("myCourses")}
        description="Courses you're enrolled in, plus your history."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/learn">Browse more courses</Link>
          </Button>
        }
      />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-5" aria-hidden />}
          title="You're not enrolled in any courses yet"
          description="All 24Asia training is free. Browse the catalogue and apply to a batch that fits your schedule."
          action={
            <Button asChild size="sm">
              <Link href="/learn">Explore free courses</Link>
            </Button>
          }
        />
      ) : (
        <>
          <section>
            <SectionHeader title={`Current (${active.length})`} />
            {active.length === 0 ? (
              <EmptyState
                compact
                icon={<BookOpen className="size-5" aria-hidden />}
                title="No active courses"
                description="Apply to an upcoming batch to keep learning."
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/learn">Browse courses</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="space-y-3">
                {active.map((row) => (
                  <li key={row.enrollment.id}>
                    <CourseCard row={row} withdrawable />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section className="mt-8">
              <SectionHeader title={`History (${past.length})`} />
              <ul className="space-y-3">
                {past.map((row) => (
                  <li key={row.enrollment.id}>
                    <CourseCard row={row} withdrawable={false} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
