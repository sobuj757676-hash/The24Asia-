import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Container, Section, Stat } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PublicSectionHeader } from "@/components/ui/page-intro";
import { MoreLink } from "@/components/ui/nav-link";
import { CardGridSkeleton, StatStripSkeleton } from "@/components/ui/skeleton";
import { MediaCover } from "@/components/public/media-cover";
import { CourseIcon, EventIcon } from "@/components/public/category-icon";
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
import { mediaUrl } from "@/lib/media";

const TRAINING_HIGHLIGHTS = [
  "Microsoft Office, AutoCAD, Graphic Design",
  "Workplace Safety & Health, Public Speaking",
  "WPLN (Workplace Literacy & Numeracy)",
];

const TRUST_POINTS = [
  { icon: BadgeCheck, label: "Always free — no fees, ever" },
  { icon: Users, label: "Run by migrant workers" },
  { icon: LifeBuoy, label: "Confidential support" },
];

/**
 * The hero is pure translated copy, so it renders synchronously and paints
 * immediately. Every database-backed band streams behind its own Suspense
 * boundary — one slow query no longer blocks the page.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <Section tone="hero" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 size-[26rem] rounded-full bg-accent-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/4 size-80 rounded-full bg-brand-500/10 blur-3xl"
        />
        <Container size="wide" className="relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            <div>
              <Badge tone="brand">Singapore · Migrant-led</Badge>
              {/*
                `text-balance` plus a max width keeps the headline to two or
                three even lines instead of the four ragged ones it wrapped to
                at desktop width.
              */}
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-[3.25rem]">
                {t("heroTitle")}
              </h1>
              <p className="mt-5 max-w-prose text-lg leading-relaxed text-[var(--muted)]">
                {t("heroBody")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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
              <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-sm text-[var(--muted)]">
                {TRUST_POINTS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-2">
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-brand-600"
                      aria-hidden
                    />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative rounded-3xl bg-brand-600 p-7 text-white shadow-2xl shadow-brand-900/20 sm:p-9">
              <div
                aria-hidden
                className="absolute inset-0 rounded-3xl opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:14px_14px]"
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                  100% free training
                </p>
                <p className="mt-2.5 text-2xl font-bold leading-snug">
                  Digital skills, safety, communication &amp; more — always free for
                  migrant workers.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-brand-50">
                  {TRAINING_HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <BadgeCheck
                        className="mt-0.5 size-4 shrink-0 text-brand-200"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="sm"
                  className="mt-7 bg-white text-brand-700 hover:bg-brand-50"
                >
                  <Link href="/learn/how-it-works">
                    How training works
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- impact */}
      <Suspense
        fallback={
          <Section tone="muted">
            <Container size="wide">
              <StatStripSkeleton />
            </Container>
          </Section>
        }
      >
        <ImpactStrip locale={locale} />
      </Suspense>

      {/* ------------------------------------------------------- courses */}
      <Suspense
        fallback={
          <Section>
            <Container size="wide">
              <CardGridSkeleton />
            </Container>
          </Section>
        }
      >
        <FeaturedCourses />
      </Suspense>

      {/* -------------------------------------------------------- events */}
      <Suspense fallback={null}>
        <UpcomingEvents locale={locale} />
      </Suspense>

      {/* ----------------------------------------------------- how to help */}
      <Section tone="muted" divide>
        <Container size="wide">
          <PublicSectionHeader
            title={t("howToHelp")}
            description="Three ways to stand with migrant workers in Singapore."
          />
          <div className="grid gap-5 sm:grid-cols-3">
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
        </Container>
      </Section>

      {/* ------------------------------------------------------ partners */}
      <Suspense fallback={null}>
        <PartnerLogos />
      </Suspense>
    </>
  );
}

/* -------------------------------------------------------- streamed bands */

async function ImpactStrip({ locale }: { locale: string }) {
  const [metrics, t, tc] = await Promise.all([
    getPublishedImpactMetrics(),
    getTranslations("home"),
    getTranslations("common"),
  ]);
  if (metrics.length === 0) return null;

  return (
    <Section tone="muted">
      <Container size="wide">
        <PublicSectionHeader
          title={t("impactTitle")}
          description="Figures we can stand behind, each with a published definition and source."
          action={<MoreLink href="/impact">{tc("viewAll")}</MoreLink>}
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
  );
}

async function FeaturedCourses() {
  const [courses, t, tc] = await Promise.all([
    getPublishedCourses(),
    getTranslations("home"),
    getTranslations("common"),
  ]);

  return (
    <Section>
      <Container size="wide">
        <PublicSectionHeader
          title={t("featuredCourses")}
          description="Free, practical courses taught by volunteers — no prior experience needed."
          action={<MoreLink href="/learn">{tc("viewAll")}</MoreLink>}
        />
        {courses.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-5" aria-hidden />}
            title="New courses coming soon"
            description="Our next intake is being planned. Check the training calendar, or subscribe and we'll tell you first."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/learn/schedule">See the training calendar</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.slice(0, 8).map((c) => (
              <Link key={c.id} href={`/learn/${c.slug}`} className="group block h-full">
                <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg">
                  <MediaCover
                    seed={c.category ?? c.slug}
                    icon={<CourseIcon category={c.category} />}
                    label={c.category ? humanise(c.category) : "Course"}
                  />
                  <CardBody className="flex flex-1 flex-col">
                    {c.isFree && <Badge tone="success" className="self-start">{tc("free")}</Badge>}
                    <CardTitle className="mt-2.5 text-base leading-snug">
                      {c.title}
                    </CardTitle>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-[var(--muted)]">
                      {c.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                      {tc("learnMore")}
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
        )}
      </Container>
    </Section>
  );
}

async function UpcomingEvents({ locale }: { locale: string }) {
  const [events, t, tc] = await Promise.all([
    getUpcomingEvents(3),
    getTranslations("home"),
    getTranslations("common"),
  ]);
  if (events.length === 0) return null;

  return (
    <Section divide>
      <Container size="wide">
        <PublicSectionHeader
          title={t("upcomingEvents")}
          description="Everyone is welcome. Bring a friend."
          action={<MoreLink href="/events">{tc("viewAll")}</MoreLink>}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  <CardTitle className="mt-2 text-base leading-snug">
                    {e.title}
                  </CardTitle>
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
      </Container>
    </Section>
  );
}

async function PartnerLogos() {
  const partners = await getPublicPartners();
  if (partners.length === 0) return null;

  return (
    <Section tone="muted" className="py-10 lg:py-12" divide>
      <Container size="wide">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Working with
        </p>
        <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.slice(0, 12).map((p) => {
            const logo = mediaUrl(p.logoStorageKey);
            return (
              <li key={p.id}>
                {/*
                  Real logo when object storage is configured; otherwise the
                  partner's name set in a confident type treatment rather than
                  the tiny grey text this row used to be.
                */}
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={p.logoAlt ?? p.name}
                    className="h-8 w-auto opacity-75 grayscale transition hover:opacity-100 hover:grayscale-0"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-base font-semibold tracking-tight text-ink-500 transition-colors hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200">
                    {p.name}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------- primitives */

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
      className="group flex flex-col gap-3 rounded-2xl border bg-[var(--card)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-200">
        {icon}
      </span>
      <span className="text-lg font-semibold tracking-tight">{title}</span>
      <span className="text-sm leading-relaxed text-[var(--muted)]">{body}</span>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-brand-700 dark:text-brand-300">
        Learn more
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
