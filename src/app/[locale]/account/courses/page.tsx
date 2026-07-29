import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { requireUser } from "@/lib/auth/session";
import { getMyEnrollments } from "@/server/queries/portal";
import { withdrawEnrollment } from "@/server/actions/learner";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("myCourses")}</h1>
      {enrollments.length === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        enrollments.map(({ enrollment, course, cohort }) => (
          <Card key={enrollment.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{course.title}</CardTitle>
                <p className="text-sm text-[var(--muted)]">
                  {cohort.code} · {cohort.locationName} ·{" "}
                  {cohort.startDate ? formatDate(cohort.startDate, locale) : "TBA"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={enrollment.status === "completed" ? "success" : "brand"}
                >
                  {enrollment.status.replace(/_/g, " ")}
                </Badge>
                {(enrollment.status === "enrolled" || enrollment.status === "offered") && (
                  <ActionButton
                    action={withdrawEnrollment.bind(null, enrollment.id)}
                    label="Withdraw"
                    variant="ghost"
                    confirm="Withdraw from this course?"
                    successMessage="Withdrawn"
                  />
                )}
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
