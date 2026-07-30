import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  group,
  groupMembership,
  post,
  reply,
  contentReport,
  person,
} from "@/db/schema";

/** Safety cap so no list query can return an unbounded result set. */
const LIST_LIMIT = 500;

export async function listActiveGroups() {
  return db.select().from(group).where(eq(group.active, true)).orderBy(group.name);
}

export async function listAllGroups() {
  return db.select().from(group).orderBy(group.name).limit(LIST_LIMIT);
}

export async function getGroupBySlug(slug: string) {
  const [g] = await db.select().from(group).where(eq(group.slug, slug)).limit(1);
  return g ?? null;
}

export async function isMember(groupId: string, personId: string) {
  const rows = await db
    .select({ id: groupMembership.id, alias: groupMembership.displayAlias })
    .from(groupMembership)
    .where(and(eq(groupMembership.groupId, groupId), eq(groupMembership.personId, personId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Published posts in a group with author alias/name and reply counts. */
export async function getGroupPosts(groupId: string) {
  const posts = await db
    .select({
      post,
      authorName: person.displayName,
      alias: groupMembership.displayAlias,
      replyCount: sql<number>`(select count(*) from ${reply} where ${reply.postId} = ${post.id} and ${reply.status} = 'published')::int`,
    })
    .from(post)
    .innerJoin(person, eq(post.authorId, person.id))
    .leftJoin(
      groupMembership,
      and(eq(groupMembership.groupId, groupId), eq(groupMembership.personId, post.authorId)),
    )
    .where(and(eq(post.groupId, groupId), eq(post.status, "published")))
    .orderBy(desc(post.createdAt))
    .limit(100);
  return posts;
}

export async function getPostReplies(postId: string) {
  return db
    .select({ reply, authorName: person.displayName })
    .from(reply)
    .innerJoin(person, eq(reply.authorId, person.id))
    .where(and(eq(reply.postId, postId), eq(reply.status, "published")))
    .orderBy(reply.createdAt)
    .limit(LIST_LIMIT);
}

/* ------------------------------------------------------------- moderation */

export async function moderationQueue() {
  const reports = await db
    .select()
    .from(contentReport)
    .where(eq(contentReport.status, "queued"))
    .orderBy(desc(contentReport.createdAt))
    .limit(LIST_LIMIT);
  const pendingPosts = await db
    .select({ post, authorName: person.displayName })
    .from(post)
    .innerJoin(person, eq(post.authorId, person.id))
    .where(eq(post.status, "pending"))
    .orderBy(desc(post.createdAt))
    .limit(LIST_LIMIT);
  return { reports, pendingPosts };
}

/** Resolve the display name for a post: alias overrides real name (COM-002). */
export function postDisplayName(alias: string | null, name: string | null) {
  return alias || name || "Member";
}
