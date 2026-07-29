import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { getAllCourses } from "@/server/queries/admin";
import { listMaterialsAll } from "@/server/queries/learning";
import { saveMaterial, deleteMaterial } from "@/server/actions/learning-manage";

export default async function AdminMaterials({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("course:manage");
  const [courses, materials] = await Promise.all([getAllCourses(), listMaterialsAll()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Learning materials</h1>
        <Link href="/admin/programs" className="text-sm text-brand-700">← Programs</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">Add material</h2>
          <form action={saveMaterial} className="grid gap-4 sm:grid-cols-2">
            <Field label="Course" htmlFor="courseId" required>
              <Select id="courseId" name="courseId" required>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </Select>
            </Field>
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" />
              </Field>
            </div>
            <Field label="URL" htmlFor="url">
              <Input id="url" name="url" placeholder="https://…" />
            </Field>
            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="downloadable" defaultChecked className="size-5" /> Downloadable
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="offlineAllowed" defaultChecked className="size-5" /> Offline
              </label>
            </div>
            <div className="sm:col-span-2"><Button type="submit">Add material</Button></div>
          </form>
        </CardBody>
      </Card>
      {materials.length === 0 ? (
        <EmptyState title="No materials yet" />
      ) : (
        <div className="space-y-2">
          {materials.map(({ material, courseTitle }) => (
            <Card key={material.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{material.title}</p>
                  <p className="text-sm text-[var(--muted)]">{courseTitle}</p>
                </div>
                <ActionButton action={deleteMaterial.bind(null, material.id)} label="Delete" variant="danger" icon confirm="Delete material?" successMessage="Deleted" />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
