import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { listEpisodes, getById } from "@/server/queries/admin";
import { saveEpisode, deleteEpisode } from "@/server/actions/manage";

export default async function AdminEpisodes({
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
  const episodes = await listEpisodes();
  const editing = await getById(episodes, edit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Live shows</h1>
        <Link href="/admin/content" className="text-sm text-brand-700">← Content</Link>
      </div>
      <Card>
        <CardBody>
          <h2 className="mb-3 font-semibold">{editing ? "Edit episode" : "Add episode"}</h2>
          <form action={saveEpisode} className="grid gap-4 sm:grid-cols-2">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Episode number" htmlFor="episodeNumber" required>
              <Input id="episodeNumber" name="episodeNumber" type="number" defaultValue={editing?.episodeNumber ?? ""} required />
            </Field>
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" defaultValue={editing?.title} required />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="description">
                <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
              </Field>
            </div>
            <Field label="Video URL" htmlFor="videoUrl">
              <Input id="videoUrl" name="videoUrl" defaultValue={editing?.videoUrl ?? ""} />
            </Field>
            <Field label="Aired at" htmlFor="airedAt">
              <Input id="airedAt" name="airedAt" type="date" defaultValue={editing?.airedAt ? new Date(editing.airedAt).toISOString().slice(0, 10) : ""} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={editing?.published ?? false} className="size-5" /> Published
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="submit">{editing ? "Save" : "Add episode"}</Button>
              {editing && <Button asChild variant="ghost"><Link href="/admin/content/episodes">Cancel</Link></Button>}
            </div>
          </form>
        </CardBody>
      </Card>
      <div className="space-y-2">
        {episodes.map((e) => (
          <Card key={e.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <p className="font-semibold">Ep {e.episodeNumber}: {e.title}</p>
              <div className="flex items-center gap-2">
                <Badge tone={e.published ? "success" : "neutral"}>{e.published ? "Published" : "Draft"}</Badge>
                <Button asChild size="sm" variant="outline"><Link href={`/admin/content/episodes?edit=${e.id}`}>Edit</Link></Button>
                <ActionButton action={deleteEpisode.bind(null, e.id)} label="Delete" variant="danger" icon confirm="Delete episode?" successMessage="Deleted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
