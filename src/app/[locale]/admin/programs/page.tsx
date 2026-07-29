import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CourseReviewButtons } from "@/components/admin/review-buttons";
import { ActionButton } from "@/components/admin/row-actions";
import {
  getAllCourses,
  getAllCohorts,
  getPendingApplications,
  getById,
} from "@/server/queries/admin";
import { saveCourse, deleteCourse, saveCohort } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";

export default async function AdminPrograms({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ editCourse?: string }>;
}) {
  const { locale } = await params;
  const { editCourse } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("course:manage");

  const [courses, cohorts, pending] = await Promise.all([
    getAllCourses(),
    getAllCohorts(),
    getPendingApplications(),
  ]);
  const editing = await getById(courses, editCourse);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Programs & learning</h1>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/admin/programs/assessments", label: "Assessments" },
            { href: "/admin/programs/certificates", label: "Certificates" },
            { href: "/admin/programs/materials", label: "Materials" },
            { href: "/admin/programs/pathways", label: "Pathways" },
          ].map((l) => (
            <Button key={l.href} asChild size="sm" variant="outline">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Application review */}
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
                      {cohort.code} · {cohort.startDate ? formatDate(cohort.startDate, locale) : "TBA"}
                    </p>
                  </div>
                  <CourseReviewButtons id={application.id} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Create/edit course */}
      <section>
        <h2 className="mb-3 text-lg font-bold">{editing ? "Edit course" : "New course"}</h2>
        <Card>
          <CardBody>
            <form action={saveCourse} className="grid gap-4 sm:grid-cols-2">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <Field label="Title" htmlFor="title" required>
                <Input id="title" name="title" defaultValue={editing?.title} required />
              </Field>
              <Field label="Category" htmlFor="category">
                <Input id="category" name="category" defaultValue={editing?.category ?? ""} placeholder="digital_literacy / safety / creative / communication / wpln" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Summary" htmlFor="summary">
                  <Textarea id="summary" name="summary" defaultValue={editing?.summary ?? ""} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Outline" htmlFor="outline">
                  <Textarea id="outline" name="outline" defaultValue={editing?.outline ?? ""} />
                </Field>
              </div>
              <Field label="Duration label" htmlFor="durationLabel">
                <Input id="durationLabel" name="durationLabel" defaultValue={editing?.durationLabel ?? ""} placeholder="6 sessions" />
              </Field>
              <Field label="Prerequisites" htmlFor="prerequisites">
                <Input id="prerequisites" name="prerequisites" defaultValue={editing?.prerequisites ?? ""} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Outcomes (one per line)" htmlFor="outcomes">
                  <Textarea id="outcomes" name="outcomes" defaultValue={(editing?.outcomes ?? []).join("\n")} />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isFree" defaultChecked={editing?.isFree ?? true} className="size-5" /> Free
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="published" defaultChecked={editing?.published ?? false} className="size-5" /> Published
              </label>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit">{editing ? "Save course" : "Create course"}</Button>
                {editing && <Button asChild variant="ghost"><Link href="/admin/programs">Cancel</Link></Button>}
              </div>
            </form>
          </CardBody>
        </Card>
      </section>

      {/* Courses list */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Courses ({courses.length})</h2>
        <div className="space-y-2">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <span className="font-medium">{c.title}</span>
                <div className="flex items-center gap-2">
                  <Badge tone={c.published ? "success" : "neutral"}>{c.published ? "Published" : "Draft"}</Badge>
                  <Button asChild size="sm" variant="outline"><Link href={`/admin/programs?editCourse=${c.id}`}>Edit</Link></Button>
                  <ActionButton action={deleteCourse.bind(null, c.id)} label="Delete" variant="danger" icon confirm={`Delete "${c.title}"?`} successMessage="Deleted" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* New cohort */}
      <section>
        <h2 className="mb-3 text-lg font-bold">New batch (cohort)</h2>
        <Card>
          <CardBody>
            <form action={saveCohort} className="grid gap-4 sm:grid-cols-2">
              <Field label="Course" htmlFor="courseId" required>
                <Select id="courseId" name="courseId" required>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Code" htmlFor="code" required hint="e.g. EXCEL-2026-B13">
                <Input id="code" name="code" required />
              </Field>
              <Field label="Status" htmlFor="status">
                <Select id="status" name="status" defaultValue="registration_open">
                  {["draft","published","registration_open","waitlist_only","registration_closed","in_progress","completed","cancelled"].map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Delivery mode" htmlFor="deliveryMode">
                <Select id="deliveryMode" name="deliveryMode" defaultValue="in_person">
                  <option value="in_person">In person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label="Location" htmlFor="locationName">
                <Input id="locationName" name="locationName" />
              </Field>
              <Field label="Capacity" htmlFor="capacity">
                <Input id="capacity" name="capacity" type="number" defaultValue={30} />
              </Field>
              <Field label="Start date" htmlFor="startDate">
                <Input id="startDate" name="startDate" type="date" />
              </Field>
              <Field label="End date" htmlFor="endDate">
                <Input id="endDate" name="endDate" type="date" />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit">Create batch</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>

      {/* Cohorts list */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Batches ({cohorts.length})</h2>
        <div className="space-y-2">
          {cohorts.map(({ cohort, course }) => (
            <Card key={cohort.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-[var(--muted)]">{cohort.code} · {cohort.locationName}</p>
                </div>
                <Badge>{cohort.status.replace(/_/g, " ")}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
