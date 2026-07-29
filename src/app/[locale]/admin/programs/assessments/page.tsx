import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Assessments</h1>
        <Link href="/admin/programs" className="text-sm text-brand-700">← Programs</Link>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">New assessment</h2>
          <form action={saveAssessment} className="grid gap-4 sm:grid-cols-2">
            <Field label="Course" htmlFor="courseId" required>
              <Select id="courseId" name="courseId" required>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" required />
            </Field>
            <Field label="Pass mark (%)" htmlFor="passMark">
              <Input id="passMark" name="passMark" type="number" defaultValue={60} />
            </Field>
            <Field label="Max attempts" htmlFor="maxAttempts">
              <Input id="maxAttempts" name="maxAttempts" type="number" defaultValue={3} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="size-5" /> Published
            </label>
            <div className="sm:col-span-2"><Button type="submit">Create</Button></div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {assessments.map(({ assessment, courseTitle }) => (
          <Card key={assessment.id}>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{assessment.title}</CardTitle>
                <p className="text-sm text-[var(--muted)]">{courseTitle} · pass {assessment.passMark}%</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={assessment.published ? "success" : "neutral"}>{assessment.published ? "Published" : "Draft"}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/programs/assessments?a=${assessment.id}`}>Questions</Link></Button>
                <ActionButton action={deleteAssessment.bind(null, assessment.id)} label="Delete" variant="danger" icon confirm="Delete assessment?" successMessage="Deleted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {selected && (
        <Card>
          <CardBody>
            <h2 className="font-semibold">Questions — {selected.assessment.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
              {selected.questions.map((q) => (
                <li key={q.id}>
                  {q.prompt}
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    (answer: {q.choices[q.correctIndex]})
                  </span>
                </li>
              ))}
              {selected.questions.length === 0 && (
                <li className="list-none text-[var(--muted)]">No questions yet.</li>
              )}
            </ol>
            <form action={addQuestion} className="mt-4 grid gap-3">
              <input type="hidden" name="assessmentId" value={selected.assessment.id} />
              <Field label="Question prompt" htmlFor="prompt" required>
                <Input id="prompt" name="prompt" required />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input name="choice0" placeholder="Choice 1" />
                <Input name="choice1" placeholder="Choice 2" />
                <Input name="choice2" placeholder="Choice 3" />
                <Input name="choice3" placeholder="Choice 4" />
              </div>
              <div className="flex items-end gap-3">
                <Field label="Correct choice index (0-3)" htmlFor="correctIndex">
                  <Input id="correctIndex" name="correctIndex" type="number" min="0" max="3" defaultValue={0} className="w-40" />
                </Field>
                <Button type="submit" variant="outline">Add question</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
