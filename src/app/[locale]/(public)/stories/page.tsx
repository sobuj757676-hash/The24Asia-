import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
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
        <PageIntro
          title="Stories & news"
          description="Updates from the 24Asia community — told, wherever possible, by the people who lived them."
        />

        {stories.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-5" aria-hidden />}
            title="No stories published yet"
            description="We share a story only with the full, informed consent of the person in it, so this page grows slowly and carefully."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/impact">See our impact figures</Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {stories.map(({ item, title, summary }) => (
              <Link
                key={item.id}
                href={`/stories/${item.slug}`}
                className="block h-full"
              >
                <Card className="flex h-full flex-col transition-all hover:border-brand-400 hover:shadow-md">
                  <CardBody className="flex flex-1 flex-col">
                    <Badge>{humanise(item.type)}</Badge>
                    <CardTitle className="mt-2.5 text-base">{title}</CardTitle>
                    {summary && (
                      <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                        {summary}
                      </p>
                    )}
                    {item.publishedAt && (
                      <p className="mt-3 text-xs text-[var(--muted)]">
                        {formatDate(item.publishedAt, locale)}
                      </p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
