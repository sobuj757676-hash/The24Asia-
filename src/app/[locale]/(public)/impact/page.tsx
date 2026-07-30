import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Stat } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, PublicSectionHeader } from "@/components/ui/page-intro";
import { Button } from "@/components/ui/button";
import { Award, BarChart3, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getPublishedImpactMetrics, getAwards } from "@/server/queries/public";

export const metadata = { title: "Our impact" };

export default async function ImpactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("impact");
  const [metrics, awards] = await Promise.all([
    getPublishedImpactMetrics(),
    getAwards(),
  ]);

  return (
    <Section>
      <Container>
        <PageIntro title={t("title")} description={t("intro")} />

        {metrics.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="size-5" aria-hidden />}
            title="Impact figures coming soon"
            description="We only publish numbers we can stand behind, with a definition and source for each one. Our next report is being prepared."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/stories">Read stories instead</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {metrics.map((m) => (
                <Stat
                  key={m.id}
                  value={m.value}
                  label={m.label}
                  hint={`As of ${formatDate(m.asOf, locale)}`}
                />
              ))}
            </div>

            {/* Every metric shows its definition + source (PRD WEB-007) */}
            <div className="mt-12">
              <PublicSectionHeader
                title="How we measure this"
                description="Each figure below shows exactly what it counts and where the data comes from, so you can judge it for yourself."
              />
              <div className="space-y-2">
                {metrics.map((m) => (
                  <details
                    key={m.id}
                    className="group rounded-2xl border bg-[var(--card)] px-4 py-3.5 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 font-medium">
                      <span>{m.label}</span>
                      <ChevronDown
                        className="size-4 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
                      <p>
                        <span className="font-semibold">{t("definition")}: </span>
                        {m.definition}
                      </p>
                      {m.source && (
                        <p className="text-[var(--muted)]">
                          <span className="font-semibold">{t("source")}: </span>
                          {m.source}
                        </p>
                      )}
                      <p className="text-[var(--muted)]">
                        <span className="font-semibold">Last updated: </span>
                        {formatDate(m.asOf, locale)}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </>
        )}

        {awards.length > 0 && (
          <div className="mt-12">
            <PublicSectionHeader title="Recognition" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {awards.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-2xl border bg-[var(--card)] p-4"
                >
                  <Award className="mt-0.5 size-5 shrink-0 text-accent-500" aria-hidden />
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {a.awardedBy}
                      {a.year ? ` · ${a.year}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 rounded-2xl border bg-ink-50/60 p-6 text-center dark:bg-ink-800/40">
          <p className="font-semibold">Want to grow these numbers with us?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/donate">Donate</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/volunteer">Volunteer</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/policies">Read our policies</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
