import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, GraduationCap, Route } from "lucide-react";
import { getPublishedCourses } from "@/server/queries/public";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");
  const tc = await getTranslations("common");
  const courses = await getPublishedCourses();

  return (
    <Section>
      <Container>
        <PageIntro
          eyebrow={<Badge tone="success">{tc("free")} for migrant workers</Badge>}
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

        {courses.length === 0 ? (
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
        ) : (
          <>
            <p className="mb-5 text-sm text-[var(--muted)]">
              {courses.length} course{courses.length === 1 ? "" : "s"} open for
              registration
            </p>
            <CardGrid>
              {courses.map((c) => (
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
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                      {c.summary}
                    </p>
                    {c.durationLabel && (
                      <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <Clock className="size-3.5" aria-hidden />
                        {t("duration")}: {c.durationLabel}
                      </p>
                    )}
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <Link href={`/learn/${c.slug}`}>{tc("learnMore")}</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </CardGrid>
          </>
        )}
      </Container>
    </Section>
  );
}
