import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Container, Section, Stat } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicSectionHeader, CardGrid } from "@/components/ui/page-intro";
import {
  GraduationCap,
  CalendarDays,
  HandHeart,
  Heart,
  MapPin,
  ArrowRight,
  BadgeCheck,
  Users,
  LifeBuoy,
} from "lucide-react";
import {
  getPublishedImpactMetrics,
  getPublishedCourses,
  getUpcomingEvents,
  getPublicPartners,
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

  const [metrics, courses, events, partners] = await Promise.all([
    getPublishedImpactMetrics(),
    getPublishedCourses(),
    getUpcomingEvents(3),
    getPublicPartners(),
  ]);

  return (
    <>
      {/* Hero */}
      <Section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50/40 to-transparent pt-10 dark:from-brand-900/25 dark:via-brand-900/10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent-500/10 blur-3xl"
        />
        <Container className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge tone="brand">Singapore · Migrant-led</Badge>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {t("heroTitle")}
              </h1>
              <p className="mt-4 max-w-prose text-lg leading-relaxed text-[var(--muted)]">
                {t("heroBody")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
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
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
                <li className="flex items-center gap-1.5">
                  <BadgeCheck className="size-4 text-brand-600" aria-hidden />
                  Always free — no fees, ever
                </li>
                <li className="flex items-center gap-1.5">
                  <Users className="size-4 text-brand-600" aria-hidden />
                  Run by migrant workers
                </li>
                <li className="flex items-center gap-1.5">
                  <LifeBuoy className="size-4 text-brand-600" aria-hidden />
                  Confidential support
                </li>
              </ul>
            </div>

            <div className="rounded-3xl bg-brand-600 p-7 text-white shadow-xl shadow-brand-900/10 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                100% free training
              </p>
              <p className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
                Digital skills, safety, communication &amp; more — always free for
                migrant workers.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-brand-50">
                {[
                  "Microsoft Office, AutoCAD, Graphic Design",
                  "Workplace Safety & Health, Public Speaking",
                  "WPLN (Workplace Literacy & Numeracy)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand-200" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-6 bg-white text-brand-700 hover:bg-brand-50"
              >
                <Link href="/learn/how-it-works">
                  How training works
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* Impact metrics */}
      {metrics.length > 0 && (
        <Section className="py-10">
          <Container>
            <PublicSectionHeader
              title={t("impactTitle")}
              action={
                <Link
                  href="/impact"
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  {tc("viewAll")} →
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
      <Section className="py-10">
        <Container>
          <PublicSectionHeader
            title={t("featuredCourses")}
            description="Free, practical courses taught by volunteers — no prior experience needed."
            action={
              <Link
                href="/learn"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                {tc("viewAll")} →
              </Link>
            }
          />
          {courses.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="size-5" aria-hidden />}
              title="New courses coming soon"
              description="Our next intake is being planned. Check the training calendar or sign up to hear first."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/learn/schedule">See the training calendar</Link>
                </Button>
              }
            />
          ) : (
            <CardGrid>
              {courses.slice(0, 6).map((c) => (
                <Card
                  key={c.id}
                  className="flex flex-col transition-shadow hover:shadow-md"
                >
                  <CardBody className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{c.category ?? "Course"}</Badge>
                      {c.isFree && <Badge tone="success">{tc("free")}</Badge>}
                    </div>
                    <CardTitle className="mt-3 text-base">{c.title}</CardTitle>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-[var(--muted)]">
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
            </CardGrid>
          )}
        </Container>
      </Section>

      {/* Upcoming events */}
      {events.length > 0 && (
        <Section className="py-10">
          <Container>
            <PublicSectionHeader
              title={t("upcomingEvents")}
              description="Everyone is welcome. Bring a friend."
              action={
                <Link
                  href="/events"
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  {tc("viewAll")} →
                </Link>
              }
            />
            <CardGrid>
              {events.map((e) => (
                <Card
                  key={e.id}
                  className="flex flex-col transition-shadow hover:shadow-md"
                >
                  <CardBody className="flex flex-1 flex-col">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-300">
                      <CalendarDays className="size-4 shrink-0" aria-hidden />
                      {formatDate(e.startsAt, locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <CardTitle className="mt-2 text-base">{e.title}</CardTitle>
                    {e.locationName && (
                      <p className="mt-1.5 flex flex-1 items-start gap-1.5 text-sm text-[var(--muted)]">
                        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                        {e.locationName}
                      </p>
                    )}
                    <div className="mt-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/events/${e.slug}`}>{tc("readMore")}</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </CardGrid>
          </Container>
        </Section>
      )}

      {/* How to help */}
      <Section className="border-t bg-ink-50/60 dark:bg-ink-800/30">
        <Container>
          <PublicSectionHeader
            title={t("howToHelp")}
            description="Three ways to stand with migrant workers in Singapore."
            className="text-center sm:text-left"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <HelpCard
              href="/volunteer"
              icon={<HandHeart className="size-6" aria-hidden />}
              title={t("helpVolunteer")}
              body="Teach a class, help at events, or offer your professional skills."
            />
            <HelpCard
              href="/donate"
              icon={<Heart className="size-6" aria-hidden />}
              title={t("helpDonate")}
              body="Fund training materials, venue costs and emergency support."
            />
            <HelpCard
              href="/about/partners"
              icon={<GraduationCap className="size-6" aria-hidden />}
              title={t("helpPartner")}
              body="Bring your organisation's training, venues or ethical job openings."
            />
          </div>

          {partners.length > 0 && (
            <div className="mt-10">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Working with
              </p>
              <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {partners.slice(0, 10).map((p) => (
                  <li key={p.id} className="text-sm font-medium text-[var(--muted)]">
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}

function HelpCard({
  href,
  icon,
  title,
  body,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border bg-[var(--card)] p-5 shadow-sm transition-all hover:border-brand-400 hover:shadow-md"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
        {icon}
      </span>
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-[var(--muted)]">{body}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-300">
        Learn more
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
