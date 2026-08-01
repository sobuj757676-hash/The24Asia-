import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormGrid, FormRow, CheckboxField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { ClipboardList } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { getAllCourses } from "@/server/queries/admin";
import {
  listAssessments,
  getAssessmentWithQuestions,
} from "@/server/queries/learning";
import {
  saveAssessment,
  addQuestion,
  deleteAssessment,
} from "@/server/actions/learning-manage";

export default async function AdminAssessments({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ a?: string }>;
}) {
  const { locale } = await params;
  const { a } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("course:manage");

  const [courses, assessments] = await Promise.all([
    getAllCourses(),
    listAssessments(),
  ]);
  const selected = a ? await getAssessmentWithQuestions(a) : null;

  return (
    <>
      <PageHeader
        title="Assessments"
        description="Create quizzes, set pass marks and manage the question bank for each course."
        breadcrumb={
          <BackLink href="/admin/programs">Programs</BackLink>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden />}
          title="Create a course first"
          description="Assessments belong to a course, so add at least one course before building a quiz."
          action={
            <Button asChild size="sm">
              <Link href="/admin/programs">Go to programs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <FormCard
            title="New assessment"
            description="Learners must reach the pass mark to earn a certificate."
            action={saveAssessment}
            submitLabel="Create assessment"
            pendingLabel="Creating…"
          >
            <Field label="Course" htmlFor="courseId" required>
              <Select id="courseId" name="courseId" required>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" required />
            </Field>
            <Field label="Pass mark (%)" htmlFor="passMark">
              <Input
                id="passMark"
                name="passMark"
                type="number"
                min="0"
                max="100"
                defaultValue={60}
              />
            </Field>
            <Field label="Max attempts" htmlFor="maxAttempts">
              <Input
                id="maxAttempts"
                name="maxAttempts"
                type="number"
                min="1"
                defaultValue={3}
              />
            </Field>
            <FormRow>
              <CheckboxField
                name="published"
                label="Publish immediately"
                description="Unpublished assessments stay hidden from learners."
              />
            </FormRow>
          </FormCard>

          <section>
            <SectionHeader
              title={`All assessments (${assessments.length})`}
              description="Select an assessment to manage its questions."
            />
            {assessments.length === 0 ? (
              <EmptyState
                compact
                icon={<ClipboardList className="size-5" aria-hidden />}
                title="No assessments yet"
                description="Create your first assessment using the form above."
              />
            ) : (
              <ul className="space-y-2">
                {assessments.map(({ assessment, courseTitle }) => (
                  <li key={assessment.id}>
                    <Card
                      className={
                        selected?.assessment.id === assessment.id
                          ? "border-brand-400 ring-1 ring-brand-200"
                          : undefined
                      }
                    >
                      <CardBody className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{assessment.title}</h3>
                          <p className="text-sm text-[var(--muted)]">
                            {courseTitle} · pass {assessment.passMark}% ·{" "}
                            {assessment.maxAttempts} attempt
                            {assessment.maxAttempts === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={assessment.published ? "published" : "draft"}
                          />
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/programs/assessments?a=${assessment.id}`}>
                              Questions
                            </Link>
                          </Button>
                          <ActionButton
                            action={deleteAssessment.bind(null, assessment.id)}
                            label="Delete"
                            variant="danger"
                            icon
                            confirm="Delete assessment? Questions and learner attempts will be removed."
                            successMessage="Deleted"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selected && (
            <Card>
              <CardBody>
                <SectionHeader
                  title={`Questions — ${selected.assessment.title}`}
                  description={`${selected.questions.length} question${selected.questions.length === 1 ? "" : "s"} in this assessment.`}
                  actions={
                    <Button asChild size="sm" variant="ghost">
                      <Link href="/admin/programs/assessments">Close</Link>
                    </Button>
                  }
                />
                {selected.questions.length === 0 ? (
                  <p className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-[var(--muted)] dark:bg-ink-800">
                    No questions yet — add the first one below.
                  </p>
                ) : (
                  <ol className="list-decimal space-y-2 pl-5 text-sm">
                    {selected.questions.map((q) => (
                      <li key={q.id}>
                        <span className="font-medium">{q.prompt}</span>
                        <span className="ml-2 text-xs text-[var(--muted)]">
                          Correct answer: {q.choices[q.correctIndex]}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}

                <form action={addQuestion} className="mt-6 space-y-4 border-t pt-5">
                  <input
                    type="hidden"
                    name="assessmentId"
                    value={selected.assessment.id}
                  />
                  <Field label="Question prompt" htmlFor="prompt" required>
                    <Input id="prompt" name="prompt" required />
                  </Field>
                  <FormGrid columns={2}>
                    {[0, 1, 2, 3].map((i) => (
                      <Field key={i} label={`Choice ${i + 1}`} htmlFor={`choice${i}`}>
                        <Input
                          id={`choice${i}`}
                          name={`choice${i}`}
                          placeholder={`Answer option ${i + 1}`}
                        />
                      </Field>
                    ))}
                  </FormGrid>
                  <div className="flex flex-wrap items-end gap-3">
                    <Field
                      label="Correct choice"
                      htmlFor="correctIndex"
                      hint="0 = first choice, 3 = fourth choice"
                    >
                      <Input
                        id="correctIndex"
                        name="correctIndex"
                        type="number"
                        min="0"
                        max="3"
                        defaultValue={0}
                        className="w-32"
                      />
                    </Field>
                    <SubmitButton variant="outline" pendingLabel="Adding…">
                      Add question
                    </SubmitButton>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
