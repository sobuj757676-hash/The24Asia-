import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Radio, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getUpcomingEvents } from "@/server/queries/public";

export const metadata = { title: "Events & Community" };

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const tc = await getTranslations("common");
  const events = await getUpcomingEvents(24);

  return (
    <Section>
      <Container>
        <PageIntro
          title={t("title")}
          description={t("intro")}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/live-shows">
                  <Radio className="size-4" aria-hidden />
                  {tc("appName")} live shows
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/community">
                  <Users className="size-4" aria-hidden />
                  Community
                </Link>
              </Button>
            </>
          }
        />

        <h2 className="mb-5 text-xl font-bold tracking-tight sm:text-2xl">
          {t("upcoming")}
        </h2>
        {events.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" aria-hidden />}
            title="No events scheduled yet"
            description="We're planning the next gatherings. Follow our community page or subscribe to the newsletter and we'll let you know as soon as dates are confirmed."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/community">Visit the community</Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {events.map((e) => (
              <Card
                key={e.id}
                className="flex flex-col transition-shadow hover:shadow-md"
              >
                <CardBody className="flex flex-1 flex-col">
                  <Badge tone="brand">{humanise(e.category)}</Badge>
                  <CardTitle className="mt-3 text-base">{e.title}</CardTitle>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <CalendarDays className="size-4 shrink-0" aria-hidden />
                    {formatDate(e.startsAt, locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {e.locationName && (
                    <p className="mt-1 flex flex-1 items-start gap-1.5 text-sm text-[var(--muted)]">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {e.locationName}
                    </p>
                  )}
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/events/${e.slug}`}>{tc("readMore")}</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
