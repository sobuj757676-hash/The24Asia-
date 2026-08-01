import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { CardGridSkeleton } from "@/components/ui/skeleton";
import { MediaCover } from "@/components/public/media-cover";
import { CourseIcon } from "@/components/public/category-icon";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Clock, GraduationCap, Route } from "lucide-react";
import { getPublishedCourses } from "@/server/queries/public";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");

  return (
    <Section>
      <Container size="wide">
        <PageIntro
          eyebrow={<Badge tone="success">Free for migrant workers</Badge>}
          title={t("title")}
          description={t("intro")}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/learn/schedule">
                  <CalendarDays className="size-4" aria-hidden />
                  {t("scheduleTitle")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/learn/pathways">
                  <Route className="size-4" aria-hidden />
                  Learning pathways
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/learn/how-it-works">How it works</Link>
              </Button>
            </>
          }
        />

        {/* Streams behind its own boundary so the intro paints immediately. */}
        <Suspense fallback={<CardGridSkeleton />}>
          <CourseList />
        </Suspense>
      </Container>
    </Section>
  );
}

async function CourseList() {
  const [courses, t, tc] = await Promise.all([
    getPublishedCourses(),
    getTranslations("learn"),
    getTranslations("common"),
  ]);

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap className="size-5" aria-hidden />}
        title="No courses open right now"
        description="We publish new intakes every few weeks. Check the training calendar for what's coming, or ask us about a course you'd like to see."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/learn/schedule">{t("scheduleTitle")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/about/contact">Contact us</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <>
      <p className="mb-5 text-sm text-[var(--muted)]">
        {courses.length} course{courses.length === 1 ? "" : "s"} open for registration
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((c) => (
          <Link key={c.id} href={`/learn/${c.slug}`} className="group block h-full">
            <Card className="flex h-full flex-col overflow-hidden transition-all group-hover:border-brand-400 group-hover:shadow-lg">
              <MediaCover
                seed={c.category ?? c.slug}
                icon={<CourseIcon category={c.category} />}
                label={c.category ? humanise(c.category) : "Course"}
              />
              <CardBody className="flex flex-1 flex-col">
                {c.isFree && <Badge tone="success" className="self-start">{tc("free")}</Badge>}
                <CardTitle className="mt-2.5 text-base leading-snug">{c.title}</CardTitle>
                <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                  {c.summary}
                </p>
                {c.durationLabel && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    <Clock className="size-3.5 shrink-0" aria-hidden />
                    {t("duration")}: {c.durationLabel}
                  </p>
                )}
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
    </>
  );
}
