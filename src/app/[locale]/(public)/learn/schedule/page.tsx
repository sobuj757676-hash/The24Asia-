import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { getOpenCohorts } from "@/server/queries/public";

export const metadata = { title: "Training schedule" };

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");
  const rows = await getOpenCohorts();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">{t("scheduleTitle")}</h1>
        {rows.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={t("noCohorts")} />
          </div>
        ) : (
          <ul className="mt-8 divide-y rounded-2xl border bg-[var(--card)]">
            {rows.map(({ cohort, course }) => (
              <li
                key={cohort.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{course.title}</span>
                    <Badge>{cohort.deliveryMode}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {cohort.startDate
                      ? formatDate(cohort.startDate, locale, { dateStyle: "full" })
                      : "Dates TBA"}{" "}
                    · {cohort.locationName}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/learn/${course.slug}`}>{t("applyNow")}</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
