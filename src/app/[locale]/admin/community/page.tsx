import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { FormCard, FormRow, CheckboxField } from "@/components/ui/form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReportActions, ApprovePostButton } from "@/components/admin/moderation-actions";
import { listAllGroups, moderationQueue } from "@/server/queries/community";
import { saveGroup } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";
import { MessagesSquare, Flag, ShieldCheck, CheckCircle2, Users } from "lucide-react";

export default async function AdminCommunity({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("moderation:handle");
  const [groups, queue] = await Promise.all([listAllGroups(), moderationQueue()]);

  const queueTotal = queue.reports.length + queue.pendingPosts.length;

  return (
    <>
      <PageHeader
        title="Community & moderation"
        description="Keep groups safe. Review reported content and posts held for approval before they appear."
      />

      <StatGrid>
        <StatCard label="Groups" value={groups.length} icon={<MessagesSquare className="size-4" />} />
        <StatCard
          label="Awaiting moderation"
          value={queueTotal}
          icon={<ShieldCheck className="size-4" />}
          tone={queueTotal > 0 ? "accent" : "neutral"}
        />
        <StatCard label="Open reports" value={queue.reports.length} icon={<Flag className="size-4" />} />
        <StatCard label="Posts held" value={queue.pendingPosts.length} icon={<Users className="size-4" />} />
      </StatGrid>

      <section className="mt-8">
        <SectionHeader
          title={`Moderation queue (${queueTotal})`}
          description="Reports are reviewed by trained moderators only. Actions are audited."
        />
        {queueTotal === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="size-5" aria-hidden />}
            title="Nothing to moderate"
            description="Reported content and posts held for approval will appear here."
          />
        ) : (
          <ul className="space-y-3">
            {queue.pendingPosts.map(({ post, authorName }) => (
              <li key={post.id}>
                <Card className="border-amber-300 dark:border-amber-800">
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Badge tone="warning">Post held for approval</Badge>
                      <p className="mt-2 max-w-prose whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm dark:bg-ink-800/60">
                        {post.body}
                      </p>
                      <p className="mt-1.5 text-xs text-[var(--muted)]">
                        {authorName ?? "Member"} ·{" "}
                        {formatDate(post.createdAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    <ApprovePostButton id={post.id} />
                  </CardBody>
                </Card>
              </li>
            ))}
            {queue.reports.map((r) => (
              <li key={r.id}>
                <Card className="border-red-300 dark:border-red-800">
                  <CardBody className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Badge tone="danger">Reported {r.targetType}</Badge>
                      <p className="mt-2 text-sm font-medium">{r.reason}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Reported {formatDate(r.createdAt, locale, { dateStyle: "medium" })}
                      </p>
                    </div>
                    <ReportActions id={r.id} />
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader
          title="Create a group"
          description="Pre-moderated groups hold every new post until a moderator approves it."
        />
        <FormCard action={saveGroup} submitLabel="Create group">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Purpose" htmlFor="purpose" hint="Shown to members">
            <Input id="purpose" name="purpose" />
          </Field>
          <FormRow>
            <Field label="Group rules" htmlFor="rules" hint="Displayed prominently in the group">
              <Textarea id="rules" name="rules" />
            </Field>
          </FormRow>
          <CheckboxField
            name="preModerate"
            label="Pre-moderate posts"
            description="Recommended for new or sensitive groups"
            defaultChecked
          />
          <CheckboxField name="active" label="Active" description="Visible to members" defaultChecked />
        </FormCard>
      </section>

      <section className="mt-8">
        <SectionHeader title={`Groups (${groups.length})`} />
        {groups.length === 0 ? (
          <EmptyState compact title="No groups yet" description="Create your first moderated group." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <Card key={g.id}>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">{g.name}</p>
                    <span className="flex gap-1.5">
                      {g.preModerate && <Badge tone="warning">Pre-moderated</Badge>}
                      <Badge tone={g.active ? "success" : "neutral"}>
                        {g.active ? "Active" : "Inactive"}
                      </Badge>
                    </span>
                  </div>
                  {g.purpose && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{g.purpose}</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
