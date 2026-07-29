import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { CourseReviewButtons } from "@/components/admin/review-buttons";
import {
  getAllCourses,
  getAllCohorts,
  getPendingApplications,
} from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminPrograms({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("application:review");

  const [courses, cohorts, pending] = await Promise.all([
    getAllCourses(),
    getAllCohorts(),
    getPendingApplications(),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-extrabold">Programs & learning</h1>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">
          Applications to review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="No applications awaiting review" />
        ) : (
          <div className="space-y-2">
            {pending.map(({ application, person, course, cohort }) => (
              <Card key={application.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {person.displayName ?? "Applicant"} → {course.title}
                    </CardTitle>
                    <p className="text-sm text-[var(--muted)]">
                      {cohort.code} ·{" "}
                      {cohort.startDate
                        ? formatDate(cohort.startDate, locale)
                        : "TBA"}
                    </p>
                    {application.accessibilityNeeds && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Needs: {application.accessibilityNeeds}
                      </p>
                    )}
                  </div>
                  <CourseReviewButtons id={application.id} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Cohorts ({cohorts.length})</h2>
        <div className="space-y-2">
          {cohorts.map(({ cohort, course }) => (
            <Card key={cohort.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {cohort.code} · {cohort.locationName}
                  </p>
                </div>
                <Badge>{cohort.status.replace(/_/g, " ")}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Courses ({courses.length})</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {courses.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border bg-[var(--card)] p-3"
            >
              <span>{c.title}</span>
              <Badge tone={c.published ? "success" : "neutral"}>
                {c.published ? "Published" : "Draft"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
