import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
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

  const [courses, pathways] = await Promise.all([getAllCourses(), listPathwaysAll()]);
  const selectedSlug = p ? pathways.find((x) => x.id === p)?.slug : undefined;
  const selected = selectedSlug ? await getPathwayBySlug(selectedSlug) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Learning pathways</h1>
        <Link href="/admin/programs" className="text-sm text-brand-700">← Programs</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">New pathway</h2>
          <form action={savePathway} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" required />
            </Field>
            <Field label="Display order" htmlFor="displayOrder">
              <Input id="displayOrder" name="displayOrder" type="number" defaultValue={0} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="size-5" /> Published
            </label>
            <div className="sm:col-span-2"><Button type="submit">Create pathway</Button></div>
          </form>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {pathways.map((pw) => (
          <Card key={pw.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{pw.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={pw.published ? "success" : "neutral"}>{pw.published ? "Published" : "Draft"}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/programs/pathways?p=${pw.id}`}>Steps</Link></Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {pathways.length === 0 && <EmptyState title="No pathways yet" />}
      </div>

      {selected && (
        <Card>
          <CardBody>
            <h2 className="font-semibold">Steps — {selected.path.title}</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              {selected.steps.map((s) => <li key={s.step.id}>{s.course.title}</li>)}
              {selected.steps.length === 0 && <li className="list-none text-[var(--muted)]">No steps yet.</li>}
            </ol>
            <form action={addPathStep} className="mt-4 flex items-end gap-3">
              <input type="hidden" name="pathId" value={selected.path.id} />
              <Field label="Add course" htmlFor="courseId">
                <Select id="courseId" name="courseId">
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </Select>
              </Field>
              <Field label="Order" htmlFor="sequence">
                <Input id="sequence" name="sequence" type="number" defaultValue={selected.steps.length} className="w-24" />
              </Field>
              <Button type="submit" variant="outline">Add step</Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
