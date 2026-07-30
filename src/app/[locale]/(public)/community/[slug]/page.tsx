import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { PostComposer } from "@/components/community/post-composer";
import { ReportButton } from "@/components/community/report-button";
import {
  ArrowLeft,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { getFlag, FLAGS } from "@/lib/flags";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getGroupBySlug,
  isMember,
  getGroupPosts,
  postDisplayName,
} from "@/server/queries/community";
import { joinGroup, createPost, reportContent } from "@/server/actions/community";
import { formatDate } from "@/lib/utils";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const enabled = await getFlag(FLAGS.COMMUNITY);
  if (!enabled) redirect("/community");

  const g = await getGroupBySlug(slug);
  if (!g) notFound();

  const user = await getCurrentUser();
  const membership = user ? await isMember(g.id, user.personId) : null;
  const posts = await getGroupPosts(g.id);

  return (
    <Section>
      <Container className="max-w-2xl">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All groups
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <h1 className="text-3xl font-extrabold tracking-tight">{g.name}</h1>
          {g.preModerate && (
            <Badge tone="info">
              <ShieldCheck className="size-3.5" aria-hidden />
              Moderated
            </Badge>
          )}
        </div>
        {g.purpose && (
          <p className="mt-2 text-[var(--muted)]">{g.purpose}</p>
        )}
        {g.rules && (
          <div className="mt-4 rounded-2xl border bg-ink-50 p-4 text-sm dark:bg-ink-800">
            <p className="font-semibold">Group rules</p>
            <p className="mt-1 text-[var(--muted)]">{g.rules}</p>
          </div>
        )}

        {/* Join / compose */}
        <div className="mt-6">
          {!user ? (
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--muted)]">
                  Sign in to read replies and post in this group.
                </p>
                <Button asChild size="sm">
                  <Link href={`/sign-in?redirect=/community/${slug}`}>Sign in</Link>
                </Button>
              </CardBody>
            </Card>
          ) : !membership ? (
            <Card>
              <CardBody>
                <div className="flex items-start gap-3">
                  <UserPlus
                    className="mt-0.5 size-5 shrink-0 text-brand-600"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">Join this group</h2>
                    <p className="mt-0.5 text-sm text-[var(--muted)]">
                      You can use an alias instead of your real name — many members
                      prefer to.
                    </p>
                    <form
                      action={joinGroup.bind(null, g.id)}
                      className="mt-3 flex flex-wrap items-end gap-3"
                    >
                      <div className="min-w-48 flex-1">
                        <Field
                          label="Display name"
                          htmlFor="displayAlias"
                          hint="Optional. Leave blank to use your account name."
                        >
                          <Input
                            id="displayAlias"
                            name="displayAlias"
                            placeholder="e.g. A friend"
                          />
                        </Field>
                      </div>
                      <SubmitButton size="sm" pendingLabel="Joining…">
                        Join group
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <PostComposer action={createPost.bind(null, g.id)} />
                {g.preModerate && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    A moderator reads every post before it appears, so there may be a
                    short delay.
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Feed */}
        <div className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            {posts.length > 0
              ? `${posts.length} post${posts.length === 1 ? "" : "s"}`
              : "Posts"}
          </h2>
          {posts.length === 0 ? (
            <EmptyState
              icon={<MessagesSquare className="size-5" aria-hidden />}
              title="No posts yet"
              description={
                membership
                  ? "Be the first to say hello — a simple introduction works well."
                  : "Join the group to start the conversation."
              }
            />
          ) : (
            posts.map(({ post, authorName, alias, replyCount }) => (
              <Card key={post.id}>
                <CardBody>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {postDisplayName(alias, authorName)}
                    </p>
                    <time
                      dateTime={new Date(post.createdAt).toISOString()}
                      className="text-xs text-[var(--muted)]"
                    >
                      {formatDate(post.createdAt, locale, { dateStyle: "medium" })}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{post.body}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="size-3.5" aria-hidden />
                      {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </span>
                    {user && (
                      <ReportButton action={reportContent.bind(null, "post", post.id)} />
                    )}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </Container>
    </Section>
  );
}
