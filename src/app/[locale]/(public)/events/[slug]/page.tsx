import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { BackLink } from "@/components/ui/nav-link";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise, StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CalendarDays, MapPin, Backpack, CheckCircle2, ExternalLink } from "lucide-react";
import { formatDate, isPast } from "@/lib/utils";
import { getEventBySlug } from "@/server/queries/public";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyRegistrationStatusMap } from "@/server/queries/portal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  if (!e) return { title: "Event" };
  return { title: e.title, description: e.description ?? undefined };
}

export default async function EventDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const tc = await getTranslations("common");
  const e = await getEventBySlug(slug);
  if (!e) notFound();

  const user = await getCurrentUser();
  const myStatus = user
    ? (await getMyRegistrationStatusMap(user.personId)).get(e.id)
    : undefined;

  const past = isPast(e.endsAt ?? e.startsAt);
  const canRegister =
    !past && ["published", "registration_open"].includes(e.status);

  return (
    <Section>
      <Container className="max-w-3xl">
        <BackLink href="/events">{tc("back")}</BackLink>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{humanise(e.category)}</Badge>
          {past && <Badge>Past event</Badge>}
          {!past && e.status === "registration_closed" && (
            <Badge tone="warning">Registration closed</Badge>
          )}
          {e.status === "cancelled" && <Badge tone="danger">Cancelled</Badge>}
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {e.title}
        </h1>

        <div className="mt-5 space-y-2.5">
          <p className="flex items-start gap-2.5">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            <span>
              {formatDate(e.startsAt, locale, {
                dateStyle: "full",
                timeStyle: "short",
              })}
              {e.endsAt && (
                <span className="text-[var(--muted)]">
                  {" – "}
                  {formatDate(e.endsAt, locale, { timeStyle: "short" })}
                </span>
              )}
            </span>
          </p>
          {e.locationName && (
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
              <span>
                {e.locationName}
                {e.mapUrl && (
                  <>
                    {" · "}
                    <a
                      href={e.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      Map
                      <ExternalLink className="size-3.5" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </>
                )}
              </span>
            </p>
          )}
        </div>

        {e.description && (
          <p className="mt-6 whitespace-pre-wrap leading-relaxed">{e.description}</p>
        )}

        {e.whatToBring && (
          <Card className="mt-6 border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20">
            <CardBody>
              <h2 className="flex items-center gap-2 font-semibold">
                <Backpack className="size-4 text-brand-600" aria-hidden />
                {t("whatToBring")}
              </h2>
              <p className="mt-1 text-sm">{e.whatToBring}</p>
            </CardBody>
          </Card>
        )}

        <div className="mt-8">
          {myStatus && myStatus !== "cancelled" ? (
            <Card>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="size-5 shrink-0 text-brand-600" aria-hidden />
                  {myStatus === "waitlisted"
                    ? "You're on the waitlist for this event."
                    : "You're registered for this event."}
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={myStatus} />
                  <Button asChild size="sm" variant="outline">
                    <Link href="/account/events">Manage</Link>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : canRegister ? (
            <Button asChild size="lg">
              <Link href={`/events/register/${e.id}`}>{t("register")}</Link>
            </Button>
          ) : (
            <div className="rounded-2xl border bg-ink-50/60 p-4 text-sm dark:bg-ink-800/50">
              <p className="font-medium">
                {past
                  ? "This event has finished."
                  : e.status === "cancelled"
                    ? "This event was cancelled."
                    : "Registration is not open for this event."}
              </p>
              <p className="mt-1 text-[var(--muted)]">
                <Link href="/events" className="font-medium underline">
                  See what&apos;s coming up next
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
