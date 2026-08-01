import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MediaCover } from "@/components/public/media-cover";
import { ArrowRight, BookOpen, Newspaper } from "lucide-react";
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

  const [lead, ...rest] = stories;

  return (
    <Section>
      <Container size="wide">
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
          <div className="space-y-6">
            {/*
              The newest story runs full width as a feature. With a handful of
              items a four-column grid left a single card stranded beside three
              empty columns, which read as a broken page rather than a young one.
            */}
            <Link href={`/stories/${lead.item.slug}`} className="group block">
              <Card className="overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg">
                <div className="grid md:grid-cols-2">
                  <MediaCover
                    storageKey={lead.coverStorageKey}
                    alt={lead.coverAlt}
                    seed={lead.item.slug}
                    icon={<Newspaper className="size-10" aria-hidden />}
                    label={humanise(lead.item.type)}
                    className="rounded-t-2xl md:h-full md:rounded-l-2xl md:rounded-tr-none"
                    priority
                  />
                  <CardBody className="flex flex-col justify-center gap-3 p-6 sm:p-8">
                    <Badge tone="brand" className="self-start">
                      Latest
                    </Badge>
                    <CardTitle className="text-2xl leading-tight">
                      {lead.title}
                    </CardTitle>
                    {lead.summary && (
                      <p className="text-[var(--muted)]">{lead.summary}</p>
                    )}
                    {lead.item.publishedAt && (
                      <p className="text-sm text-[var(--muted)]">
                        {formatDate(lead.item.publishedAt, locale, {
                          dateStyle: "long",
                        })}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 font-semibold text-brand-700 dark:text-brand-300">
                      Read the story
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </CardBody>
                </div>
              </Card>
            </Link>

            {rest.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(({ item, title, summary, coverStorageKey, coverAlt }) => (
                  <Link
                    key={item.id}
                    href={`/stories/${item.slug}`}
                    className="group block h-full"
                  >
                    <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg">
                      <MediaCover
                        storageKey={coverStorageKey}
                        alt={coverAlt}
                        seed={item.slug}
                        icon={<Newspaper className="size-8" aria-hidden />}
                        label={humanise(item.type)}
                      />
                      <CardBody className="flex flex-1 flex-col">
                        <CardTitle className="text-base leading-snug">
                          {title}
                        </CardTitle>
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
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
