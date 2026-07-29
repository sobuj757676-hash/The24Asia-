import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { listStories } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Stories & news" };

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stories = await listStories();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">Stories & news</h1>
        <p className="mt-2 text-[var(--muted)]">Updates from the 24Asia community.</p>
        {stories.length === 0 ? (
          <div className="mt-8"><EmptyState title="No stories published yet" /></div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map(({ item, title, summary }) => (
              <Link key={item.id} href={`/stories/${item.slug}`}>
                <Card className="h-full transition-colors hover:border-brand-400">
                  <CardBody>
                    <Badge>{item.type}</Badge>
                    <CardTitle className="mt-2 text-base">{title}</CardTitle>
                    {summary && <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">{summary}</p>}
                    {item.publishedAt && (
                      <p className="mt-2 text-xs text-[var(--muted)]">{formatDate(item.publishedAt, locale)}</p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
