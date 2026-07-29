import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  getCourseBySlug,
  getOpenCohorts,
  getCohortFilled,
} from "@/server/queries/public";

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

  const cohorts = await getOpenCohorts(course.id);
  const filled = await Promise.all(
    cohorts.map(async (c) => ({
      id: c.cohort.id,
      count: await getCohortFilled(c.cohort.id),
    })),
  );
  const filledMap = new Map(filled.map((f) => [f.id, f.count]));

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/learn" className="text-sm text-brand-700">
          ← {tc("back")}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {course.category && <Badge>{course.category}</Badge>}
          {course.isFree && <Badge tone="success">{tc("free")}</Badge>}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold">{course.title}</h1>
        {course.summary && (
          <p className="mt-2 text-lg text-[var(--muted)]">{course.summary}</p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {course.durationLabel && (
            <div>
              <dt className="text-sm font-semibold">{t("duration")}</dt>
              <dd className="text-sm text-[var(--muted)]">
                {course.durationLabel}
              </dd>
            </div>
          )}
          {course.prerequisites && (
            <div>
              <dt className="text-sm font-semibold">{t("prerequisites")}</dt>
              <dd className="text-sm text-[var(--muted)]">
                {course.prerequisites}
              </dd>
            </div>
          )}
        </dl>

        {course.outcomes && course.outcomes.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold">{t("outcomes")}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {course.outcomes.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        )}

        {course.outline && (
          <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed">
            {course.outline}
          </div>
        )}

        <h2 className="mt-10 text-xl font-bold">{t("scheduleTitle")}</h2>
        <div className="mt-4 space-y-3">
          {cohorts.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{t("noCohorts")}</p>
          ) : (
            cohorts.map(({ cohort }) => {
              const count = filledMap.get(cohort.id) ?? 0;
              return (
                <Card key={cohort.id}>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {cohort.startDate
                          ? formatDate(cohort.startDate, locale, {
                              dateStyle: "full",
                            })
                          : "Dates to be announced"}
                      </p>
                      <p className="text-sm text-[var(--muted)]">
                        {cohort.locationName} · {t("mode")}: {cohort.deliveryMode}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {t("capacity", {
                          spots: count,
                          capacity: cohort.capacity,
                        })}
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/learn/apply/${cohort.id}`}>
                        {t("applyNow")}
                      </Link>
                    </Button>
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
