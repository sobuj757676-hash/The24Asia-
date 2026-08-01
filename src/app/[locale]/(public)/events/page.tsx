import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { MediaCover } from "@/components/public/media-cover";
import { EventIcon } from "@/components/public/category-icon";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, MapPin, Radio, Users } from "lucide-react";
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

  return (
    <Section>
      <Container size="wide">
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
        {/* Streams behind its own boundary so the intro paints immediately. */}
        <Suspense fallback={<CardGridSkeleton />}>
          <EventList locale={locale} />
        </Suspense>
      </Container>
    </Section>
  );
}

async function EventList({ locale }: { locale: string }) {
  const [events, tc] = await Promise.all([
    getUpcomingEvents(24),
    getTranslations("common"),
  ]);

  if (events.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {events.map((e) => (
        <Link key={e.id} href={`/events/${e.slug}`} className="group block h-full">
          <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg">
            <MediaCover
              seed={e.category}
              icon={<EventIcon category={e.category} />}
              label={humanise(e.category)}
            />
            <CardBody className="flex flex-1 flex-col">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                <CalendarDays className="size-4 shrink-0" aria-hidden />
                {formatDate(e.startsAt, locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <CardTitle className="mt-2 text-base leading-snug">{e.title}</CardTitle>
              {e.locationName && (
                <p className="mt-1.5 flex flex-1 items-start gap-1.5 text-sm text-[var(--muted)]">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {e.locationName}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                {tc("readMore")}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
}
