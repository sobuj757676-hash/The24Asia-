import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import { Route } from "lucide-react";
import { getAllCourses } from "@/server/queries/admin";
import { listPathwaysAll, getPathwayBySlug } from "@/server/queries/learning";
import { savePathway, addPathStep } from "@/server/actions/learning-manage";

export default async function AdminPathways({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { locale } = await params;
  const { p } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("course:manage");

  const [courses, pathways] = await Promise.all([
    getAllCourses(),
    listPathwaysAll(),
  ]);
  const selectedSlug = p ? pathways.find((x) => x.id === p)?.slug : undefined;
  const selected = selectedSlug ? await getPathwayBySlug(selectedSlug) : null;

  return (
    <>
      <PageHeader
        title="Learning pathways"
        description="Group courses into a guided sequence so learners always know what to study next."
        breadcrumb={
          <Link href="/admin/programs" className="hover:underline">
            ← Programs
          </Link>
        }
      />

      <div className="space-y-6">
        <FormCard
          title="New pathway"
          description="A pathway is an ordered series of courses, e.g. “Digital skills foundation”."
          action={savePathway}
          submitLabel="Create pathway"
          pendingLabel="Creating…"
        >
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" required />
          </Field>
          <Field
            label="Display order"
            htmlFor="displayOrder"
            hint="Lower numbers appear first."
          >
            <Input id="displayOrder" name="displayOrder" type="number" defaultValue={0} />
          </Field>
          <FormRow>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" name="description" rows={3} />
            </Field>
          </FormRow>
          <FormRow>
            <CheckboxField
              name="published"
              label="Publish immediately"
              description="Published pathways are visible on the public learning pages."
            />
          </FormRow>
        </FormCard>

        <section>
          <SectionHeader
            title={`All pathways (${pathways.length})`}
            description="Choose a pathway to manage the courses inside it."
          />
          {pathways.length === 0 ? (
            <EmptyState
              compact
              icon={<Route className="size-5" aria-hidden />}
              title="No pathways yet"
              description="Create your first pathway above, then add courses as steps."
            />
          ) : (
            <ul className="space-y-2">
              {pathways.map((pw) => (
                <li key={pw.id}>
                  <Card
                    className={
                      selected?.path.id === pw.id
                        ? "border-brand-400 ring-1 ring-brand-200"
                        : undefined
                    }
                  >
                    <CardBody className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{pw.title}</h3>
                        {pw.description && (
                          <p className="text-sm text-[var(--muted)]">{pw.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={pw.published ? "published" : "draft"} />
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/programs/pathways?p=${pw.id}`}>
                            Manage steps
                          </Link>
                        </Button>
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
                title={`Steps — ${selected.path.title}`}
                description={`${selected.steps.length} course${selected.steps.length === 1 ? "" : "s"} in this pathway.`}
                actions={
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/admin/programs/pathways">Close</Link>
                  </Button>
                }
              />
              {selected.steps.length === 0 ? (
                <p className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-[var(--muted)] dark:bg-ink-800">
                  No steps yet — add the first course below.
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {selected.steps.map((s, i) => (
                    <li
                      key={s.step.id}
                      className="flex items-center gap-3 rounded-xl border bg-[var(--card)] px-3 py-2 text-sm"
                    >
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                        {i + 1}
                      </span>
                      <span className="font-medium">{s.course.title}</span>
                    </li>
                  ))}
                </ol>
              )}

              {courses.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  Create a course before adding steps.
                </p>
              ) : (
                <form
                  action={addPathStep}
                  className="mt-6 flex flex-wrap items-end gap-3 border-t pt-5"
                >
                  <input type="hidden" name="pathId" value={selected.path.id} />
                  <div className="min-w-56 flex-1">
                    <Field label="Add course" htmlFor="courseId">
                      <Select id="courseId" name="courseId">
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Position" htmlFor="sequence">
                    <Input
                      id="sequence"
                      name="sequence"
                      type="number"
                      min="0"
                      defaultValue={selected.steps.length}
                      className="w-28"
                    />
                  </Field>
                  <SubmitButton variant="outline" pendingLabel="Adding…">
                    Add step
                  </SubmitButton>
                </form>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}
