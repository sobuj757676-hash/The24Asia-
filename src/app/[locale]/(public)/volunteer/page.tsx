import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublishedOpportunities } from "@/server/queries/public";

export const metadata = { title: "Volunteer opportunities" };

export default async function VolunteerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("volunteerPublic");
  const opportunities = await getPublishedOpportunities();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">{t("intro")}</p>

        {opportunities.length === 0 ? (
          <div className="mt-8">
            <EmptyState title={t("title")} />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <Card key={o.id}>
                <CardBody>
                  <Badge
                    tone={o.riskLevel === "high" ? "warning" : "neutral"}
                  >
                    {o.riskLevel} risk
                  </Badge>
                  <CardTitle className="mt-2">{o.title}</CardTitle>
                  <p className="mt-1 line-clamp-3 text-sm text-[var(--muted)]">
                    {o.purpose}
                  </p>
                  {o.commitment && (
                    <p className="mt-3 text-xs text-[var(--muted)]">
                      {t("commitment")}: {o.commitment}
                    </p>
                  )}
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href={`/volunteer/apply/${o.slug}`}>
                        {t("applyNow")}
                      </Link>
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
