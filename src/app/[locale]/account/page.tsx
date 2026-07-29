import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import {
  getMyEnrollments,
  getMyApplications,
  getMyEventRegistrations,
  getRecommendedCourses,
} from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

export default async function AccountDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();

  const [enrollments, applications, events, recommended] = await Promise.all([
    getMyEnrollments(user.personId),
    getMyApplications(user.personId),
    getMyEventRegistrations(user.personId),
    getRecommendedCourses(user.personId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">
          {t("learnerDashboard")}
        </h1>
        <p className="text-[var(--muted)]">
          {user.displayName || user.name || user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">
              {enrollments.length}
            </p>
            <p className="text-sm text-[var(--muted)]">{t("myCourses")}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">
              {applications.length}
            </p>
            <p className="text-sm text-[var(--muted)]">{t("myApplications")}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-3xl font-bold text-brand-600">{events.length}</p>
            <p className="text-sm text-[var(--muted)]">{t("myEvents")}</p>
          </CardBody>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t("myApplications")}</h2>
        {applications.length === 0 ? (
          <EmptyState
            title={t("noData")}
            action={
              <Button asChild size="sm">
                <Link href="/learn">Browse courses</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {applications.map(({ application, course, cohort }) => (
              <Card key={application.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <p className="text-sm text-[var(--muted)]">
                      {cohort.code} ·{" "}
                      {cohort.startDate
                        ? formatDate(cohort.startDate, locale)
                        : "TBA"}
                    </p>
                  </div>
                  <Badge
                    tone={
                      application.status === "approved"
                        ? "success"
                        : application.status === "declined"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    {application.status.replace(/_/g, " ")}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {recommended.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Recommended for you</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommended.map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <CardTitle className="text-base">{c.title}</CardTitle>
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
    </div>
  );
}
