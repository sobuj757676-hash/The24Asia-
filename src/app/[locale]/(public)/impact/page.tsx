import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, Section, Stat } from "@/components/ui/misc";
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
        <h1 className="text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">{t("intro")}</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
        <div className="mt-8 space-y-3">
          {metrics.map((m) => (
            <details key={m.id} className="rounded-xl border bg-[var(--card)] p-4">
              <summary className="cursor-pointer font-medium">
                {m.label}
              </summary>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{t("definition")}: </span>
                {m.definition}
              </p>
              {m.source && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  <span className="font-semibold">{t("source")}: </span>
                  {m.source}
                </p>
              )}
            </details>
          ))}
        </div>

        {awards.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-bold">Awards</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {awards.map((a) => (
                <li key={a.id} className="rounded-xl border bg-[var(--card)] p-4">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {a.awardedBy} {a.year ? `· ${a.year}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Container>
    </Section>
  );
}
