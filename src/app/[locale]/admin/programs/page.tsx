import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
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
import {
  GraduationCap, BookOpen, ClipboardList, Award, FileText,
  Route, CheckCircle2, CalendarPlus,
} from "lucide-react";

const COHORT_STATUSES = [
  "draft", "published", "registration_open", "waitlist_only",
  "registration_closed", "in_progress", "completed", "cancelled",
];

type CohortRow = Awaited<ReturnType<typeof getAllCohorts>>[number];

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

  const publishedCourses = courses.filter((c) => c.published).length;
  const openCohorts = cohorts.filter((c) =>
    ["registration_open", "waitlist_only", "in_progress"].includes(c.cohort.status),
  ).length;

  const cohortColumns: Column<CohortRow>[] = [
    {
      key: "course",
      label: "Batch",
      primary: true,
      render: ({ cohort, course }) => (
        <span className="flex flex-col">
          <span className="font-medium">{course.title}</span>
          <span className="font-mono text-xs text-[var(--muted)]">{cohort.code}</span>
        </span>
      ),
    },
    {
      key: "when",
      label: "Starts",
      render: ({ cohort }) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {cohort.startDate ? formatDate(cohort.startDate, locale, { dateStyle: "medium" }) : "TBA"}
        </span>
      ),
    },
    {
      key: "where",
      label: "Location",
      hideOnMobile: true,
      render: ({ cohort }) => (
        <span className="text-[var(--muted)]">{cohort.locationName ?? "—"}</span>
      ),
    },
    {
      key: "mode",
      label: "Mode",
      render: ({ cohort }) => <Badge>{cohort.deliveryMode.replace(/_/g, " ")}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: ({ cohort }) => <StatusBadge status={cohort.status} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: ({ cohort }) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/programs/cohorts/${cohort.id}`}>Sessions &amp; attendance</Link>
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Programs & learning"
        description="Courses, batches, applications and attendance."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/programs/assessments">
                <FileText className="size-4" aria-hidden /> Assessments
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/programs/certificates">
                <Award className="size-4" aria-hidden /> Certificates
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/programs/materials">
                <BookOpen className="size-4" aria-hidden /> Materials
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/programs/pathways">
                <Route className="size-4" aria-hidden /> Pathways
              </Link>
            </Button>
          </>
        }
      />

      <StatGrid>
        <StatCard label="Courses" value={courses.length} icon={<GraduationCap className="size-4" />} />
        <StatCard label="Published" value={publishedCourses} icon={<BookOpen className="size-4" />} />
        <StatCard label="Open batches" value={openCohorts} icon={<CalendarPlus className="size-4" />} />
        <StatCard
          label="Applications to review"
          value={pending.length}
          icon={<ClipboardList className="size-4" />}
          tone={pending.length > 0 ? "accent" : "neutral"}
        />
      </StatGrid>

      {/* Review queue - the most time-sensitive task on this page */}
      <section className="mt-8">
        <SectionHeader
          title={`Applications to review (${pending.length})`}
          description="Approving a learner enrols them and reserves a seat."
        />
        {pending.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            title="No applications waiting"
            description="New course applications appear here for review."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map(({ application, person, course, cohort }) => (
              <li key={application.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-semibold">
                        {person.displayName ?? "Applicant"}
                        <StatusBadge status={application.status} />
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        {course.title} · {cohort.code} ·{" "}
                        {cohort.startDate
                          ? formatDate(cohort.startDate, locale, { dateStyle: "medium" })
                          : "dates TBA"}
                      </p>
                      {application.accessibilityNeeds && (
                        <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-sm dark:bg-amber-900/20">
                          <span className="font-medium">Support needed: </span>
                          {application.accessibilityNeeds}
                        </p>
                      )}
                    </div>
                    <CourseReviewButtons id={application.id} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Course editor */}
      <section className="mt-8">
        <SectionHeader title={editing ? `Edit “${editing.title}”` : "Create a course"} />
        <FormCard
          action={saveCourse}
          submitLabel={editing ? "Save course" : "Create course"}
          secondaryAction={
            editing ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/programs">Cancel</Link>
              </Button>
            ) : null
          }
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.title} required />
          </Field>
          <Field
            label="Category"
            htmlFor="category"
            hint="digital_literacy, safety, creative, communication, wpln"
          >
            <Input id="category" name="category" defaultValue={editing?.category ?? ""} />
          </Field>
          <FormRow>
            <Field label="Summary" htmlFor="summary" hint="Shown in the course catalogue">
              <Textarea id="summary" name="summary" defaultValue={editing?.summary ?? ""} />
            </Field>
          </FormRow>
          <FormRow>
            <Field label="Outline" htmlFor="outline" hint="Session-by-session content">
              <Textarea id="outline" name="outline" defaultValue={editing?.outline ?? ""} />
            </Field>
          </FormRow>
          <Field label="Duration label" htmlFor="durationLabel" hint="e.g. 6 sessions">
            <Input id="durationLabel" name="durationLabel" defaultValue={editing?.durationLabel ?? ""} />
          </Field>
          <Field label="Prerequisites" htmlFor="prerequisites">
            <Input id="prerequisites" name="prerequisites" defaultValue={editing?.prerequisites ?? ""} />
          </Field>
          <FormRow>
            <Field label="Learning outcomes" htmlFor="outcomes" hint="One per line">
              <Textarea id="outcomes" name="outcomes" defaultValue={(editing?.outcomes ?? []).join("\n")} />
            </Field>
          </FormRow>
          <CheckboxField
            name="isFree"
            label="Free of charge"
            description="All 24Asia training is free"
            defaultChecked={editing?.isFree ?? true}
          />
          <CheckboxField
            name="published"
            label="Published"
            description="Visible in the public catalogue"
            defaultChecked={editing?.published ?? false}
          />
        </FormCard>
      </section>

      {/* Courses list */}
      <section className="mt-8">
        <SectionHeader title={`Courses (${courses.length})`} />
        {courses.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-5" aria-hidden />}
            title="No courses yet"
            description="Create your first course to start scheduling batches."
          />
        ) : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {c.title}
                        <Badge tone={c.published ? "success" : "neutral"}>
                          {c.published ? "Published" : "Draft"}
                        </Badge>
                      </p>
                      {c.durationLabel && (
                        <p className="text-xs text-[var(--muted)]">{c.durationLabel}</p>
                      )}
                    </div>
                    <span className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/programs?editCourse=${c.id}`}>Edit</Link>
                      </Button>
                      <ActionButton
                        action={deleteCourse.bind(null, c.id)}
                        label="Delete"
                        variant="danger"
                        icon
                        confirmTitle={`Delete “${c.title}”?`}
                        confirm="Batches, applications and enrolments for this course will also be removed. This cannot be undone."
                        successMessage="Course deleted"
                      />
                    </span>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* New batch */}
      {courses.length > 0 && (
        <section className="mt-8">
          <SectionHeader title="Schedule a batch" description="A dated run of a course that learners apply to." />
          <FormCard action={saveCohort} submitLabel="Create batch">
            <Field label="Course" htmlFor="courseId" required>
              <Select id="courseId" name="courseId" required>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Batch code" htmlFor="code" required hint="e.g. EXCEL-2026-B13">
              <Input id="code" name="code" required />
            </Field>
            <Field label="Status" htmlFor="status">
              <Select id="status" name="status" defaultValue="registration_open">
                {COHORT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
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
              <Input id="capacity" name="capacity" type="number" min="1" defaultValue={30} />
            </Field>
            <Field label="Start date" htmlFor="startDate">
              <Input id="startDate" name="startDate" type="date" />
            </Field>
            <Field label="End date" htmlFor="endDate">
              <Input id="endDate" name="endDate" type="date" />
            </Field>
          </FormCard>
        </section>
      )}

      {/* Cohorts */}
      <section className="mt-8">
        <SectionHeader title={`Batches (${cohorts.length})`} />
        {cohorts.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus className="size-5" aria-hidden />}
            title="No batches scheduled"
            description="Schedule a batch so learners can apply."
          />
        ) : (
          <DataList columns={cohortColumns} rows={cohorts} getKey={({ cohort }) => cohort.id} caption="Batches" />
        )}
      </section>
    </>
  );
}
