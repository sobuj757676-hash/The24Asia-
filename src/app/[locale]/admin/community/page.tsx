import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ReportActions, ApprovePostButton } from "@/components/admin/moderation-actions";
import { listAllGroups, moderationQueue } from "@/server/queries/community";
import { saveGroup } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";

export default async function AdminCommunity({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("content:read");
  const [groups, queue] = await Promise.all([listAllGroups(), moderationQueue()]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold">Community & moderation</h1>

      <section>
        <h2 className="mb-3 text-lg font-bold">Moderation queue</h2>
        {queue.pendingPosts.length === 0 && queue.reports.length === 0 ? (
          <EmptyState title="Nothing to moderate" />
        ) : (
          <div className="space-y-2">
            {queue.pendingPosts.map(({ post, authorName }) => (
              <Card key={post.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <Badge tone="warning">Pending post</Badge>
                    <p className="mt-1 text-sm">{post.body}</p>
                    <p className="text-xs text-[var(--muted)]">{authorName} · {formatDate(post.createdAt, locale)}</p>
                  </div>
                  <ApprovePostButton id={post.id} />
                </CardBody>
              </Card>
            ))}
            {queue.reports.map((r) => (
              <Card key={r.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <Badge tone="danger">Report</Badge>
                    <p className="mt-1 text-sm">{r.reason}</p>
                    <p className="text-xs text-[var(--muted)]">{r.targetType} · {formatDate(r.createdAt, locale)}</p>
                  </div>
                  <ReportActions id={r.id} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Create group</h2>
        <Card>
          <CardBody>
            <form action={saveGroup} className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="name" required>
                <Input id="name" name="name" required />
              </Field>
              <Field label="Purpose" htmlFor="purpose">
                <Input id="purpose" name="purpose" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Rules" htmlFor="rules">
                  <Textarea id="rules" name="rules" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="preModerate" defaultChecked className="size-5" /> Pre-moderate posts
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked className="size-5" /> Active
              </label>
              <div className="sm:col-span-2"><Button type="submit">Create group</Button></div>
            </form>
          </CardBody>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Groups ({groups.length})</h2>
        <div className="space-y-2">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <span className="font-medium">{g.name}</span>
                <div className="flex items-center gap-2">
                  {g.preModerate && <Badge>Moderated</Badge>}
                  <Badge tone={g.active ? "success" : "neutral"}>{g.active ? "Active" : "Inactive"}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
