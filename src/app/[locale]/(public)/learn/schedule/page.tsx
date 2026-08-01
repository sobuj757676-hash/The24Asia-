import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge, humanise } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getOpenCohorts, getCohortFilledMap } from "@/server/queries/public";

export const metadata = { title: "Training schedule" };

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");
  const [rows, filled] = await Promise.all([getOpenCohorts(), getCohortFilledMap()]);

  return (
    <Section>
      <Container size="wide">
        <PageIntro
          title={t("scheduleTitle")}
          description="Every intake currently open for registration. Classes are free — bring a friend."
          actions={
            <Button asChild variant="outline">
              <Link href="/learn">Browse all courses</Link>
            </Button>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-5" aria-hidden />}
            title={t("noCohorts")}
            description="The next intake dates are being confirmed. Browse the course list to see what we teach, and we'll announce dates here as soon as they're set."
            action={
              <Button asChild size="sm">
                <Link href="/learn">See courses</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-[var(--card)]">
            {rows.map(({ cohort, course }) => {
              const taken = filled.get(cohort.id) ?? 0;
              const remaining =
                cohort.capacity != null ? Math.max(cohort.capacity - taken, 0) : null;
              const isFull = remaining === 0;
              return (
                <li
                  key={cohort.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{course.title}</span>
                      <Badge>{humanise(cohort.deliveryMode)}</Badge>
                      {isFull && <Badge tone="warning">Full — waitlist</Badge>}
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                        {cohort.startDate
                          ? formatDate(cohort.startDate, locale, { dateStyle: "full" })
                          : "Dates to be announced"}
                      </span>
                      {cohort.locationName && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0" aria-hidden />
                          {cohort.locationName}
                        </span>
                      )}
                      {remaining != null && !isFull && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5 shrink-0" aria-hidden />
                          {remaining} place{remaining === 1 ? "" : "s"} left
                        </span>
                      )}
                    </p>
                  </div>
                  <Button asChild size="sm" variant={isFull ? "outline" : "primary"}>
                    <Link href={`/learn/${course.slug}`}>
                      {isFull ? "Join waitlist" : t("applyNow")}
                    </Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}
