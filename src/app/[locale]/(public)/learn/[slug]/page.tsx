import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  getCourseBySlug,
  getOpenCohorts,
  getCohortFilledMap,
} from "@/server/queries/public";
import { getCurrentUser } from "@/lib/auth/session";
import { getAppliedCohortIds } from "@/server/queries/portal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course" };
  return { title: course.title, description: course.summary ?? undefined };
}

export default async function CourseDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");
  const tc = await getTranslations("common");

  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const [cohorts, filledMap, applied] = await Promise.all([
    getOpenCohorts(course.id),
    getCohortFilledMap(),
    user ? getAppliedCohortIds(user.personId) : Promise.resolve(new Set<string>()),
  ]);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link
          href="/learn"
          className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          ← {tc("back")}
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {course.category && <Badge>{humanise(course.category)}</Badge>}
          {course.isFree && (
            <Badge tone="success">
              <BadgeCheck className="size-3.5" aria-hidden />
              {tc("free")}
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {course.title}
        </h1>
        {course.summary && (
          <p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">
            {course.summary}
          </p>
        )}

        {(course.durationLabel || course.prerequisites) && (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {course.durationLabel && (
              <div className="rounded-2xl border bg-[var(--card)] p-4">
                <dt className="flex items-center gap-1.5 text-sm font-semibold">
                  <Clock className="size-4 text-brand-600" aria-hidden />
                  {t("duration")}
                </dt>
                <dd className="mt-1 text-sm text-[var(--muted)]">
                  {course.durationLabel}
                </dd>
              </div>
            )}
            {course.prerequisites && (
              <div className="rounded-2xl border bg-[var(--card)] p-4">
                <dt className="flex items-center gap-1.5 text-sm font-semibold">
                  <Target className="size-4 text-brand-600" aria-hidden />
                  {t("prerequisites")}
                </dt>
                <dd className="mt-1 text-sm text-[var(--muted)]">
                  {course.prerequisites}
                </dd>
              </div>
            )}
          </dl>
        )}

        {course.outcomes && course.outcomes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold tracking-tight">{t("outcomes")}</h2>
            <ul className="mt-3 space-y-2">
              {course.outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-brand-600"
                    aria-hidden
                  />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.outline && (
          <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed">
            {course.outline}
          </div>
        )}

        <h2 className="mt-10 text-xl font-bold tracking-tight">
          {t("scheduleTitle")}
        </h2>
        <div className="mt-4 space-y-3">
          {cohorts.length === 0 ? (
            <EmptyState
              compact
              icon={<CalendarDays className="size-5" aria-hidden />}
              title={t("noCohorts")}
              description="Tell us you're interested and we'll let you know when the next batch opens."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/about/contact">Register interest</Link>
                </Button>
              }
            />
          ) : (
            cohorts.map(({ cohort }) => {
              const count = filledMap.get(cohort.id) ?? 0;
              const full = count >= cohort.capacity;
              const alreadyApplied = applied.has(cohort.id);
              return (
                <Card key={cohort.id}>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {cohort.startDate
                          ? formatDate(cohort.startDate, locale, {
                              dateStyle: "full",
                            })
                          : "Dates to be announced"}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                        {cohort.locationName && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0" aria-hidden />
                            {cohort.locationName}
                          </span>
                        )}
                        <span>
                          {t("mode")}: {humanise(cohort.deliveryMode)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5 shrink-0" aria-hidden />
                          {t("capacity", {
                            spots: count,
                            capacity: cohort.capacity,
                          })}
                        </span>
                      </p>
                    </div>
                    {alreadyApplied ? (
                      <div className="flex items-center gap-2">
                        <Badge tone="success">
                          <CheckCircle2 className="size-3.5" aria-hidden />
                          Applied
                        </Badge>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/account/courses">Track</Link>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild size="sm" variant={full ? "outline" : "primary"}>
                        <Link href={`/learn/apply/${cohort.id}`}>
                          {full ? "Join waitlist" : t("applyNow")}
                        </Link>
                      </Button>
                    )}
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </Section>
  );
}
