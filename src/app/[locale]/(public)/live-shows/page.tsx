import { setRequestLocale } from "next-intl/server";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
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
        <h1 className="text-3xl font-extrabold">Live shows</h1>
        <p className="mt-2 text-[var(--muted)]">
          Our live shows entertain and connect the migrant community.
        </p>
        {episodes.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No episodes published yet" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((ep) => (
              <Card key={ep.id}>
                <CardBody>
                  <Badge>Episode {ep.episodeNumber}</Badge>
                  <CardTitle className="mt-2 text-base">{ep.title}</CardTitle>
                  {ep.airedAt && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDate(ep.airedAt, locale)}
                    </p>
                  )}
                  {ep.videoUrl && (
                    <a
                      href={ep.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-brand-700"
                    >
                      Watch →
                    </a>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
