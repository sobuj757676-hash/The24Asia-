import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getPublishedAssessment,
  getMyAttemptSummary,
} from "@/server/queries/learning";
import { submitAttempt } from "@/server/actions/assess";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle2, TriangleAlert } from "lucide-react";

export const metadata = { robots: { index: false } };

export default async function TakeAssessment({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const data = await getPublishedAssessment(id);
  if (!data) notFound();
  const { assessment, questions } = data;

  const summary = await getMyAttemptSummary(id, user.personId);
  const remaining = Math.max(assessment.maxAttempts - summary.used, 0);
  const canAttempt = !summary.passed && remaining > 0 && questions.length > 0;
  const action = submitAttempt.bind(null, id);

  return (
    <>
      <PageHeader
        title={assessment.title}
        description={`Pass mark ${assessment.passMark}%. Choose the best answer for each question — there's no time limit.`}
        breadcrumb={
          <Link href="/account/assessments" className="hover:underline">
            ← My assessments
          </Link>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {summary.passed && (
              <Badge tone="success">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Passed
              </Badge>
            )}
            <Badge tone={remaining > 0 ? "neutral" : "warning"}>
              {remaining} of {assessment.maxAttempts} attempt
              {assessment.maxAttempts === 1 ? "" : "s"} left
            </Badge>
          </div>
        }
      />

      {summary.passed ? (
        <EmptyState
          icon={<CheckCircle2 className="size-5" aria-hidden />}
          title="You've already passed this assessment"
          description={`Your best score was ${summary.best}%. There's nothing more to do here — your certificate is issued once your course is complete.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <Link href="/account/certificates">My certificates</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/account/courses">My courses</Link>
              </Button>
            </div>
          }
        />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden />}
          title="This assessment isn't ready yet"
          description="Your trainer hasn't added the questions. Please check back, or ask them when it will be available."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/account/assessments">Back to assessments</Link>
            </Button>
          }
        />
      ) : remaining === 0 ? (
        <EmptyState
          icon={<TriangleAlert className="size-5" aria-hidden />}
          title="No attempts left"
          description={`You've used all ${assessment.maxAttempts} attempts, with a best score of ${summary.best}%. Speak to your trainer — they can reset your attempts if appropriate.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/account/support">Contact my trainer</Link>
            </Button>
          }
        />
      ) : (
        <>
          {summary.used > 0 && (
            <p className="mb-5 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-2.5 text-sm dark:border-amber-800 dark:bg-amber-900/20">
              You&apos;ve tried this {summary.used} time
              {summary.used === 1 ? "" : "s"} before — best score {summary.best}%. Take
              your time; only your best attempt counts.
            </p>
          )}

          <form action={action} className="space-y-4">
            <ol className="space-y-4">
              {questions.map((q, i) => (
                <li key={q.id}>
                  <Card>
                    <CardBody>
                      <fieldset>
                        <legend className="font-medium">
                          <span className="text-[var(--muted)]">
                            Question {i + 1} of {questions.length}
                          </span>
                          <span className="mt-1 block">{q.prompt}</span>
                        </legend>
                        <div className="mt-3 space-y-2">
                          {(q.choices as string[]).map((choice, ci) => (
                            <label
                              key={ci}
                              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors hover:bg-ink-50 has-checked:border-brand-500 has-checked:bg-brand-50 dark:hover:bg-ink-800 dark:has-checked:bg-brand-900/25"
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={ci}
                                required
                                className="size-4 shrink-0 accent-brand-600"
                              />
                              {choice}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton size="lg" pendingLabel="Marking your answers…">
                Submit answers
              </SubmitButton>
              <p className="text-xs text-[var(--muted)]">
                This will use one of your {remaining} remaining attempt
                {remaining === 1 ? "" : "s"}.
              </p>
            </div>
          </form>
        </>
      )}

      {!canAttempt && summary.attempts.length > 0 && (
        <p className="mt-6 text-xs text-[var(--muted)]">
          Attempts recorded: {summary.attempts.length}. Best score {summary.best}%.
        </p>
      )}
    </>
  );
}
