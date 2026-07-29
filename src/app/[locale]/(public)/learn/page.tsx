import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">{t("intro")}</p>

        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/learn/schedule">{t("scheduleTitle")}</Link>
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={tc("loading")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.id}>
                <CardBody>
                  <div className="flex items-center gap-2">
                    <Badge>{c.category ?? "Course"}</Badge>
                    {c.isFree && <Badge tone="success">{tc("free")}</Badge>}
                  </div>
                  <CardTitle className="mt-2">{c.title}</CardTitle>
                  <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">
                    {c.summary}
                  </p>
                  {c.durationLabel && (
                    <p className="mt-3 text-xs text-[var(--muted)]">
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
          </div>
        )}
      </Container>
    </Section>
  );
}
