import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { getContentItem } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = (await getContentItem("story", slug)) ?? (await getContentItem("news", slug));
  return { title: story?.tr.title ?? "Story", description: story?.tr.summary ?? undefined };
}

export default async function StoryDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const story = (await getContentItem("story", slug)) ?? (await getContentItem("news", slug));
  if (!story) notFound();

  return (
    <Section>
      <Container className="max-w-2xl">
        <Link href="/stories" className="text-sm text-brand-700 dark:text-brand-300">← Stories</Link>
        <Badge className="mt-3">{story.item.type}</Badge>
        <h1 className="mt-2 text-3xl font-extrabold">{story.tr.title}</h1>
        {story.item.publishedAt && (
          <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(story.item.publishedAt, locale, { dateStyle: "long" })}</p>
        )}
        {story.tr.summary && <p className="mt-4 text-lg text-[var(--muted)]">{story.tr.summary}</p>}
        {story.tr.body && (
          <div className="mt-6 whitespace-pre-wrap leading-relaxed">{story.tr.body}</div>
        )}
      </Container>
    </Section>
  );
}
