import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Container, Section, Stat, Badge } from "@/components/ui/misc";
import { GraduationCap, CalendarDays, HandHeart, Heart } from "lucide-react";
import {
  getPublishedImpactMetrics,
  getPublishedCourses,
  getUpcomingEvents,
} from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [metrics, courses, events] = await Promise.all([
    getPublishedImpactMetrics(),
    getPublishedCourses(),
    getUpcomingEvents(3),
  ]);

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-b from-brand-50 to-transparent dark:from-brand-900/20">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Badge tone="brand">Singapore · Migrant-led</Badge>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 max-w-prose text-lg text-[var(--muted)]">
                {t("heroBody")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/learn">
                    <GraduationCap className="size-5" aria-hidden />
                    {t("heroCtaLearn")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/volunteer">
                    <HandHeart className="size-5" aria-hidden />
                    {t("heroCtaVolunteer")}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-3xl bg-brand-600 p-8 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-brand-100">
                100% free training
              </p>
              <p className="mt-2 text-2xl font-bold">
                Digital skills, safety, communication & more — always free for
                migrant workers.
              </p>
              <ul className="mt-4 space-y-1 text-brand-50">
                <li>• Microsoft Office, AutoCAD, Graphic Design</li>
                <li>• Workplace Safety & Health, Public Speaking</li>
                <li>• WPLN (Workplace Literacy & Numeracy)</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Impact metrics */}
      {metrics.length > 0 && (
        <Section className="py-8">
          <Container>
            <h2 className="text-xl font-bold">{t("impactTitle")}</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((m) => (
                <Stat
                  key={m.id}
                  value={m.value}
                  label={m.label}
                  hint={t("impactAsOf", { date: formatDate(m.asOf, locale) })}
                />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Featured courses */}
      <Section className="py-8">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-bold">{t("featuredCourses")}</h2>
            <Link href="/learn" className="text-sm font-medium text-brand-700">
              {tc("viewAll")}
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <Badge>{c.category ?? "Course"}</Badge>
                  <CardTitle className="mt-2">{c.title}</CardTitle>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {c.summary}
                  </p>
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/learn/${c.slug}`}>{tc("learnMore")}</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
            {courses.length === 0 && (
              <p className="text-sm text-[var(--muted)]">{tc("loading")}</p>
            )}
          </div>
        </Container>
      </Section>

      {/* Upcoming events */}
      {events.length > 0 && (
        <Section className="py-8">
          <Container>
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-bold">{t("upcomingEvents")}</h2>
              <Link href="/events" className="text-sm font-medium text-brand-700">
                {tc("viewAll")}
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <Card key={e.id}>
                  <CardBody>
                    <div className="flex items-center gap-2 text-sm text-brand-700">
                      <CalendarDays className="size-4" aria-hidden />
                      {formatDate(e.startsAt, locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <CardTitle className="mt-2">{e.title}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {e.locationName}
                    </p>
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${e.slug}`}>{tc("readMore")}</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* How to help */}
      <Section>
        <Container>
          <h2 className="text-center text-2xl font-bold">{t("howToHelp")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <HelpCard href="/volunteer" icon={<HandHeart className="size-6" />} title={t("helpVolunteer")} />
            <HelpCard href="/donate" icon={<Heart className="size-6" />} title={t("helpDonate")} />
            <HelpCard href="/about/partners" icon={<GraduationCap className="size-6" />} title={t("helpPartner")} />
          </div>
        </Container>
      </Section>
    </>
  );
}

function HelpCard({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border bg-[var(--card)] p-5 transition-colors hover:border-brand-400"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
    </Link>
  );
}
