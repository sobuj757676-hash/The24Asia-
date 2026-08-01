import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BackLink } from "@/components/ui/nav-link";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/status-badge";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { DataList, type Column } from "@/components/ui/data-list";
import { FileText, Download, WifiOff } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { getAllCourses } from "@/server/queries/admin";
import { listMaterialsAll } from "@/server/queries/learning";
import { saveMaterial, deleteMaterial } from "@/server/actions/learning-manage";

type Row = Awaited<ReturnType<typeof listMaterialsAll>>[number];

export default async function AdminMaterials({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("course:manage");
  const [courses, materials] = await Promise.all([
    getAllCourses(),
    listMaterialsAll(),
  ]);

  const columns: Column<Row>[] = [
    {
      key: "title",
      label: "Material",
      primary: true,
      render: ({ material }) => (
        <div className="min-w-0">
          <span className="font-medium">{material.title}</span>
          {material.description && (
            <span className="block text-xs text-[var(--muted)]">
              {material.description}
            </span>
          )}
        </div>
      ),
    },
    { key: "course", label: "Course", render: ({ courseTitle }) => courseTitle },
    {
      key: "flags",
      label: "Access",
      render: ({ material }) => (
        <div className="flex flex-wrap gap-1.5">
          {material.downloadable && (
            <Badge tone="info">
              <Download className="size-3" aria-hidden />
              Downloadable
            </Badge>
          )}
          {material.offlineAllowed && (
            <Badge tone="info">
              <WifiOff className="size-3" aria-hidden />
              Offline
            </Badge>
          )}
          {!material.downloadable && !material.offlineAllowed && (
            <span className="text-xs text-[var(--muted)]">Online only</span>
          )}
        </div>
      ),
    },
    {
      key: "url",
      label: "Link",
      hideOnMobile: true,
      render: ({ material }) =>
        material.url ? (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-700 dark:text-brand-300 underline-offset-2 hover:underline"
          >
            Open
          </a>
        ) : (
          <span className="text-xs text-[var(--muted)]">—</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: ({ material }) => (
        <ActionButton
          action={deleteMaterial.bind(null, material.id)}
          label="Delete"
          variant="danger"
          icon
          confirm="Delete this material? Learners will lose access to it."
          successMessage="Deleted"
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Learning materials"
        description="Handouts, videos and worksheets attached to each course. Mark items downloadable so learners with limited data can study offline."
        breadcrumb={
          <BackLink href="/admin/programs">Programs</BackLink>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" aria-hidden />}
          title="Create a course first"
          description="Materials attach to a course, so add at least one course before uploading resources."
          action={
            <Button asChild size="sm">
              <Link href="/admin/programs">Go to programs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <FormCard
            title="Add material"
            action={saveMaterial}
            submitLabel="Add material"
            pendingLabel="Adding…"
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
            <FormRow>
              <Field
                label="Description"
                htmlFor="description"
                hint="Tell learners what this resource covers."
              >
                <Textarea id="description" name="description" rows={3} />
              </Field>
            </FormRow>
            <Field label="URL" htmlFor="url" hint="Link to the file or video.">
              <Input id="url" name="url" type="url" placeholder="https://…" />
            </Field>
            <div className="space-y-2.5 pt-1 sm:pt-7">
              <CheckboxField
                name="downloadable"
                label="Downloadable"
                defaultChecked
              />
              <CheckboxField
                name="offlineAllowed"
                label="Available offline"
                description="Cached by the app for low-data users."
                defaultChecked
              />
            </div>
          </FormCard>

          <section>
            <SectionHeader title={`All materials (${materials.length})`} />
            {materials.length === 0 ? (
              <EmptyState
                compact
                icon={<FileText className="size-5" aria-hidden />}
                title="No materials yet"
                description="Add your first resource with the form above."
              />
            ) : (
              <DataList
                columns={columns}
                rows={materials}
                getKey={({ material }) => material.id}
                caption="Learning materials across all courses"
              />
            )}
          </section>
        </div>
      )}
    </>
  );
}
