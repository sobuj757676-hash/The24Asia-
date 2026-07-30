import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { ActionButton } from "@/components/admin/row-actions";
import { listEpisodes, getById } from "@/server/queries/admin";
import { saveEpisode, deleteEpisode } from "@/server/actions/manage";
import { formatDate } from "@/lib/utils";
import { Radio } from "lucide-react";

type Row = Awaited<ReturnType<typeof listEpisodes>>[number];

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

  const columns: Column<Row>[] = [
    {
      key: "title",
      label: "Episode",
      primary: true,
      render: (e) => (
        <span className="font-medium">
          Ep {e.episodeNumber}: {e.title}
        </span>
      ),
    },
    {
      key: "aired",
      label: "Aired",
      render: (e) => (
        <span className="whitespace-nowrap text-[var(--muted)]">
          {e.airedAt ? formatDate(e.airedAt, locale) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (e) => (
        <Badge tone={e.published ? "success" : "neutral"}>
          {e.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (e) => (
        <span className="flex justify-end gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/content/episodes?edit=${e.id}`}>Edit</Link>
          </Button>
          <ActionButton
            action={deleteEpisode.bind(null, e.id)}
            label="Delete"
            variant="danger"
            icon
            confirmTitle={`Delete episode ${e.episodeNumber}?`}
            confirm="This episode will be removed from the public archive. This cannot be undone."
            successMessage="Episode deleted"
          />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Live shows"
        description="The episode archive shown on the public live-shows page."
        breadcrumb={
          <Link href="/admin/content" className="hover:text-brand-700 dark:text-brand-300">
            ← Content
          </Link>
        }
      />

      <FormCard
        title={editing ? `Edit episode ${editing.episodeNumber}` : "Add an episode"}
        action={saveEpisode}
        submitLabel={editing ? "Save changes" : "Add episode"}
        secondaryAction={
          editing ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/content/episodes">Cancel</Link>
            </Button>
          ) : null
        }
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <Field label="Episode number" htmlFor="episodeNumber" required>
          <Input id="episodeNumber" name="episodeNumber" type="number" defaultValue={editing?.episodeNumber ?? ""} required />
        </Field>
        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" defaultValue={editing?.title} required />
        </Field>
        <FormRow>
          <Field label="Description" htmlFor="description">
            <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
          </Field>
        </FormRow>
        <Field label="Video URL" htmlFor="videoUrl">
          <Input id="videoUrl" name="videoUrl" type="url" defaultValue={editing?.videoUrl ?? ""} placeholder="https://…" />
        </Field>
        <Field label="Aired on" htmlFor="airedAt">
          <Input
            id="airedAt"
            name="airedAt"
            type="date"
            defaultValue={editing?.airedAt ? new Date(editing.airedAt).toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field label="Guests" htmlFor="guests">
          <Input id="guests" name="guests" defaultValue={editing?.guests ?? ""} />
        </Field>
        <CheckboxField name="published" label="Published" defaultChecked={editing?.published ?? false} />
      </FormCard>

      <section className="mt-8">
        <SectionHeader title={`All episodes (${episodes.length})`} />
        {episodes.length === 0 ? (
          <EmptyState
            icon={<Radio className="size-5" aria-hidden />}
            title="No episodes yet"
            description="Add your live-show episodes to build the public archive."
          />
        ) : (
          <DataList columns={columns} rows={episodes} getKey={(e) => e.id} caption="Live show episodes" />
        )}
      </section>
    </>
  );
}
