import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { listContentPages, getContentForEdit } from "@/server/queries/admin";
import { saveContent } from "@/server/actions/manage";
import { FileText } from "lucide-react";

type Row = Awaited<ReturnType<typeof listContentPages>>[number];

export default async function AdminPages({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { locale } = await params;
  const { edit } = await searchParams;
  setRequestLocale(locale);
  await requirePermission("content:publish");
  const pages = await listContentPages();
  const editing = edit ? await getContentForEdit(edit) : null;

  const columns: Column<Row>[] = [
    {
      key: "title",
      label: "Title",
      primary: true,
      render: (r) => <span className="font-medium">{r.title ?? r.item.slug}</span>,
    },
    { key: "type", label: "Type", render: (r) => <Badge>{r.item.type}</Badge> },
    {
      key: "slug",
      label: "URL",
      render: (r) => <span className="font-mono text-xs text-[var(--muted)]">/{r.item.slug}</span>,
    },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.item.status} /> },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (r) => (
        <span className="flex justify-end gap-2">
          {r.item.status === "published" &&
            (r.item.type === "story" || r.item.type === "news") && (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/stories/${r.item.slug}`}>View</Link>
              </Button>
            )}
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/content/pages?edit=${r.item.id}`}>Edit</Link>
          </Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pages & articles"
        description="Structured content for the public site. Stories and news appear in the public stories feed."
        breadcrumb={
          <Link href="/admin/content" className="hover:text-brand-700">
            ← Content
          </Link>
        }
      />

      <FormCard
        title={editing ? `Edit “${editing.tr?.title ?? editing.item.slug}”` : "New content"}
        action={saveContent}
        submitLabel={editing ? "Save changes" : "Create content"}
        secondaryAction={
          editing ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/content/pages">Cancel</Link>
            </Button>
          ) : null
        }
      >
        {editing && <input type="hidden" name="id" value={editing.item.id} />}
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={editing?.item.type ?? "page"}>
            <option value="page">Page</option>
            <option value="story">Story</option>
            <option value="news">News</option>
            <option value="faq">FAQ</option>
            <option value="policy">Policy</option>
          </Select>
        </Field>
        <Field label="Category" htmlFor="category">
          <Input id="category" name="category" defaultValue={editing?.item.category ?? ""} />
        </Field>
        <FormRow>
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={editing?.tr?.title ?? ""} required />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Summary" htmlFor="summary" hint="Shown in listings and search results">
            <Textarea id="summary" name="summary" defaultValue={editing?.tr?.summary ?? ""} />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Body" htmlFor="body" hint="Markdown supported">
            <Textarea
              id="body"
              name="body"
              className="min-h-56 font-mono text-sm"
              defaultValue={editing?.tr?.body ?? ""}
            />
          </Field>
        </FormRow>
        <CheckboxField
          name="publish"
          label="Publish"
          description="Make visible on the public site"
          defaultChecked={editing?.item.status === "published"}
        />
      </FormCard>

      <section className="mt-8">
        <SectionHeader title={`All content (${pages.length})`} />
        {pages.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" aria-hidden />}
            title="No content yet"
            description="Create your first page, story or FAQ."
          />
        ) : (
          <DataList columns={columns} rows={pages} getKey={(r) => r.item.id} caption="Content items" />
        )}
      </section>
    </>
  );
}
