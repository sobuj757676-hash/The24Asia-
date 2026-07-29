import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { listContentPages, getContentForEdit } from "@/server/queries/admin";
import { saveContent } from "@/server/actions/manage";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Pages & articles</h1>
        <Link href="/admin/content" className="text-sm text-brand-700">← Content</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit content" : "New content"}</h2>
          <form action={saveContent} className="grid gap-4 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <Field label="Title" htmlFor="title" required>
                <Input id="title" name="title" defaultValue={editing?.tr?.title ?? ""} required />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Summary" htmlFor="summary">
                <Textarea id="summary" name="summary" defaultValue={editing?.tr?.summary ?? ""} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Body (markdown)" htmlFor="body">
                <Textarea id="body" name="body" className="min-h-48" defaultValue={editing?.tr?.body ?? ""} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="publish" defaultChecked={editing?.item.status === "published"} className="size-5" /> Publish
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/content/pages">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-2">
        {pages.map(({ item, title }) => (
          <Card key={item.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{title ?? item.slug}</p>
                <p className="text-sm text-[var(--muted)]">{item.type} · /{item.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={item.status === "published" ? "success" : "neutral"}>{item.status}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/content/pages?edit=${item.id}`}>Edit</Link></Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
