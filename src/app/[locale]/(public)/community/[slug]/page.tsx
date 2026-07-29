import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostComposer } from "@/components/community/post-composer";
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
        <Link href="/community" className="text-sm text-brand-700">← Community</Link>
        <div className="mt-3 flex items-center gap-2">
          <h1 className="text-3xl font-extrabold">{g.name}</h1>
          {g.preModerate && <Badge>Moderated</Badge>}
        </div>
        {g.purpose && <p className="mt-2 text-[var(--muted)]">{g.purpose}</p>}
        {g.rules && (
          <div className="mt-3 rounded-xl border bg-ink-50 p-3 text-sm dark:bg-ink-800">
            <span className="font-semibold">Group rules: </span>{g.rules}
          </div>
        )}

        {/* Join / compose */}
        <div className="mt-6">
          {!user ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/sign-in?redirect=/community/${slug}`}>Sign in to participate</Link>
            </Button>
          ) : !membership ? (
            <form action={joinGroup.bind(null, g.id)} className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="displayAlias" className="block text-sm font-medium">
                  Display name (optional alias)
                </label>
                <Input id="displayAlias" name="displayAlias" placeholder="e.g. A friend" className="mt-1 w-56" />
              </div>
              <Button type="submit" size="sm">Join group</Button>
            </form>
          ) : (
            <Card>
              <CardBody>
                <PostComposer action={createPost.bind(null, g.id)} />
                {g.preModerate && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Posts are reviewed by a moderator before appearing.
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Feed */}
        <div className="mt-6 space-y-3">
          {posts.length === 0 ? (
            <EmptyState title="No posts yet" body="Be the first to say hello." />
          ) : (
            posts.map(({ post, authorName, alias, replyCount }) => (
              <Card key={post.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {postDisplayName(alias, authorName)}
                    </p>
                    <span className="text-xs text-[var(--muted)]">
                      {formatDate(post.createdAt, locale, { dateStyle: "medium" })}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{post.body}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted)]">
                    <span>{replyCount} replies</span>
                    {user && (
                      <form action={reportContent.bind(null, "post", post.id)}>
                        <input type="hidden" name="reason" value="Reported by member" />
                        <button type="submit" className="text-danger hover:underline">
                          Report
                        </button>
                      </form>
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
