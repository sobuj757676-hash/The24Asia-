import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { availableAssessments } from "@/server/queries/learning";
import { getMyAttempts } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

export default async function LearnerAssessments({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [items, attempts] = await Promise.all([
    availableAssessments(user.personId),
    getMyAttempts(user.personId),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Assessments</h1>
      {items.length === 0 ? (
        <EmptyState title="No assessments available" body="Assessments appear here for courses you are enrolled in." />
      ) : (
        items.map(({ assessment, courseTitle }) => (
          <Card key={assessment.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{assessment.title}</CardTitle>
                <p className="text-sm text-[var(--muted)]">{courseTitle} · pass mark {assessment.passMark}%</p>
              </div>
              <Button asChild size="sm">
                <Link href={`/account/assessments/${assessment.id}`}>Start</Link>
              </Button>
            </CardBody>
          </Card>
        ))
      )}

      {attempts.length > 0 && (
        <section className="pt-4">
          <h2 className="mb-3 text-lg font-bold">My results</h2>
          <div className="space-y-2">
            {attempts.map(({ attempt, title }) => (
              <Card key={attempt.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {formatDate(attempt.createdAt, locale, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <Badge tone={attempt.status === "passed" ? "success" : attempt.status === "failed" ? "danger" : "neutral"}>
                    {attempt.scorePercent ?? 0}% · {attempt.status}
                  </Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
