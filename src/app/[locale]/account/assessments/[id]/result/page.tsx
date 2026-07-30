import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import {
  getPublishedAssessment,
  getMyAttemptSummary,
} from "@/server/queries/learning";
import { formatDate } from "@/lib/utils";

export const metadata = { robots: { index: false } };

/**
 * The outcome is read from the learner's recorded attempt, not from the query
 * string. The previous version rendered whatever `?passed=&score=` said, so
 * anyone could show themselves a fabricated pass — misleading at best, and it
 * looked like a real grading flaw to anyone who noticed.
 */
export default async function AssessmentResult({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const data = await getPublishedAssessment(id);
  if (!data) notFound();
  const summary = await getMyAttemptSummary(id, user.personId);
  const latest = summary.attempts[0];
  if (!latest) notFound();

  const didPass = latest.status === "passed";
  const score = latest.scorePercent ?? 0;
  const remaining = Math.max(data.assessment.maxAttempts - summary.used, 0);

  return (
    <Section>
      <Container className="max-w-md text-center">
        <span
          className={`mx-auto grid size-16 place-items-center rounded-full ${
            didPass
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
          }`}
        >
          {didPass ? (
            <CheckCircle2 className="size-8" aria-hidden />
          ) : (
            <XCircle className="size-8" aria-hidden />
          )}
        </span>

        <h1 className="mt-4 text-2xl font-bold">
          {didPass ? "You passed!" : "Not passed yet"}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{data.assessment.title}</p>

        <p className="mt-4 text-4xl font-extrabold tabular-nums text-brand-600">
          {score}%
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pass mark {data.assessment.passMark}%
          {summary.used > 1 ? ` · best so far ${summary.best}%` : ""}
        </p>
        {latest.submittedAt && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            Submitted {formatDate(latest.submittedAt, locale, { dateStyle: "medium" })}
          </p>
        )}

        <p className="mt-4 text-[var(--muted)]">
          {didPass
            ? "Great work. Your trainer will confirm your certificate once the course is complete."
            : remaining > 0
              ? "Review the course material and try again when you're ready — only your best attempt counts."
              : "You've used all your attempts. Your trainer can reset them if something went wrong."}
        </p>

        {!didPass && (
          <div className="mt-3">
            <Badge tone={remaining > 0 ? "neutral" : "warning"}>
              {remaining} attempt{remaining === 1 ? "" : "s"} left
            </Badge>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {didPass ? (
            <Button asChild>
              <Link href="/account/certificates">My certificates</Link>
            </Button>
          ) : remaining > 0 ? (
            <Button asChild>
              <Link href={`/account/assessments/${id}`}>
                <RotateCcw className="size-4" aria-hidden />
                Try again
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/account/materials">Review materials</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/account/assessments">All assessments</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
