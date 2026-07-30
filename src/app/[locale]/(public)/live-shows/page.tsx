import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radio, Play } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getPublishedEpisodes } from "@/server/queries/public";

export const metadata = { title: "Live shows" };

export default async function LiveShowsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const episodes = await getPublishedEpisodes();

  return (
    <Section>
      <Container>
        <PageIntro
          eyebrow={
            <Badge tone="brand">
              <Radio className="size-3.5" aria-hidden />
              24Asia Live
            </Badge>
          }
          title="Live shows"
          description="Music, talk and talent from the migrant community — hosted by us, starring you."
          actions={
            <Button asChild variant="outline">
              <Link href="/events">See upcoming events</Link>
            </Button>
          }
        />

        {episodes.length === 0 ? (
          <EmptyState
            icon={<Radio className="size-5" aria-hidden />}
            title="No episodes published yet"
            description="Our next season is in production. Want to perform or help behind the scenes? We'd love to hear from you."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/volunteer">Get involved</Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {episodes.map((ep) => (
              <Card
                key={ep.id}
                className="flex flex-col transition-shadow hover:shadow-md"
              >
                <CardBody className="flex flex-1 flex-col">
                  <Badge>Episode {ep.episodeNumber}</Badge>
                  <CardTitle className="mt-2.5 text-base">{ep.title}</CardTitle>
                  {ep.description && (
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                      {ep.description}
                    </p>
                  )}
                  {ep.airedAt && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Aired {formatDate(ep.airedAt, locale)}
                    </p>
                  )}
                  {ep.videoUrl && (
                    <div className="mt-3">
                      <Button asChild size="sm" variant="outline">
                        <a href={ep.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="size-4" aria-hidden />
                          Watch
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
