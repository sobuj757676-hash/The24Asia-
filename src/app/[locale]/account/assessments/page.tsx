import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { availableAssessments } from "@/server/queries/learning";
import { getMyAttempts } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";
import { GraduationCap, Trophy, RotateCcw } from "lucide-react";

export default async function LearnerAssessments({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const user = await requireUser();
  const [items, attempts] = await Promise.all([
    availableAssessments(user.personId),
    getMyAttempts(user.personId),
  ]);

  // Best result per assessment so learners see where they stand.
  const bestByAssessment = new Map<string, number>();
  for (const a of attempts) {
    const prev = bestByAssessment.get(a.attempt.assessmentId) ?? -1;
    if ((a.attempt.scorePercent ?? 0) > prev) {
      bestByAssessment.set(a.attempt.assessmentId, a.attempt.scorePercent ?? 0);
    }
  }
  const attemptCount = new Map<string, number>();
  for (const a of attempts) {
    attemptCount.set(
      a.attempt.assessmentId,
      (attemptCount.get(a.attempt.assessmentId) ?? 0) + 1,
    );
  }

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Short quizzes for the courses you're enrolled in. You can retake them if you don't pass first time."
      />

      {error === "no_attempts_left" && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-sm dark:border-amber-800 dark:bg-amber-900/20"
        >
          <p className="font-semibold">You&apos;ve used all your attempts</p>
          <p className="text-[var(--muted)]">
            Your trainer can reset them if there was a problem — ask them through{" "}
            <Link href="/account/support" className="font-medium underline">
              support
            </Link>
            .
          </p>
        </div>
      )}

      <section>
        <SectionHeader title="Available now" />
        {items.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-5" aria-hidden />}
            title="No assessments available"
            description="Assessments appear here once your trainer publishes one for a course you're enrolled in."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/account/courses">View my courses</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map(({ assessment, courseTitle }) => {
              const used = attemptCount.get(assessment.id) ?? 0;
              const best = bestByAssessment.get(assessment.id);
              const passed = best !== undefined && best >= assessment.passMark;
              const exhausted = used >= assessment.maxAttempts;
              return (
                <li key={assessment.id}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-semibold">
                          {assessment.title}
                          {passed && <Badge tone="success">Passed</Badge>}
                        </p>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          {courseTitle} · pass mark {assessment.passMark}%
                          {best !== undefined ? ` · best ${best}%` : ""}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Attempt {Math.min(used + (passed ? 0 : 1), assessment.maxAttempts)} of{" "}
                          {assessment.maxAttempts}
                        </p>
                      </div>
                      {passed ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/account/assessments/${assessment.id}`}>Review</Link>
                        </Button>
                      ) : exhausted ? (
                        <Badge tone="warning">No attempts left — ask your trainer</Badge>
                      ) : (
                        <Button asChild size="sm">
                          <Link href={`/account/assessments/${assessment.id}`}>
                            {used > 0 ? (
                              <>
                                <RotateCcw className="size-4" aria-hidden /> Try again
                              </>
                            ) : (
                              "Start"
                            )}
                          </Link>
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {attempts.length > 0 && (
        <section className="mt-8">
          <SectionHeader title={`My results (${attempts.length})`} />
          <ul className="space-y-2">
            {attempts.map(({ attempt, title }) => (
              <li key={attempt.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        <Trophy className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                        {title}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatDate(attempt.createdAt, locale, { dateStyle: "medium" })}
                      </p>
                    </div>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">
                        {attempt.scorePercent ?? 0}%
                      </span>
                      <StatusBadge status={attempt.status} />
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
