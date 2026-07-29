import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";
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
        <h1 className="text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">{t("intro")}</p>

        <h2 className="mt-8 text-xl font-bold">{t("upcoming")}</h2>
        {events.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={t("upcoming")} body={tc("loading")} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <Card key={e.id}>
                <CardBody>
                  <Badge tone="brand">{e.category.replace(/_/g, " ")}</Badge>
                  <CardTitle className="mt-2">{e.title}</CardTitle>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                    <CalendarDays className="size-4" aria-hidden />
                    {formatDate(e.startsAt, locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  {e.locationName && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--muted)]">
                      <MapPin className="size-4" aria-hidden />
                      {e.locationName}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/events/${e.slug}`}
                      className="text-sm font-medium text-brand-700"
                    >
                      {tc("readMore")} →
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
