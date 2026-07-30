import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, HandHeart, MapPin, ShieldCheck, GraduationCap } from "lucide-react";
import { getPublishedOpportunities } from "@/server/queries/public";

export const metadata = { title: "Volunteer opportunities" };

const RISK_TONE = { low: "neutral", medium: "warning", high: "danger" } as const;

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
        <PageIntro
          eyebrow={<Badge tone="brand">Volunteer with 24Asia</Badge>}
          title={t("title")}
          description={t("intro")}
        />

        {/* What to expect — reduces drop-off before applying */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <HandHeart className="size-5" aria-hidden />,
              title: "Apply for a role",
              body: "Tell us your skills and availability. Every application gets a reply.",
            },
            {
              icon: <ShieldCheck className="size-5" aria-hidden />,
              title: "Onboarding & safeguarding",
              body: "You'll accept our code of conduct and, for some roles, complete a short check.",
            },
            {
              icon: <GraduationCap className="size-5" aria-hidden />,
              title: "Start contributing",
              body: "Pick shifts, log your hours and claim any out-of-pocket costs.",
            },
          ].map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border bg-[var(--card)] p-5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {step.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Step {i + 1}
                </span>
              </div>
              <h2 className="mt-3 font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{step.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-5 text-xl font-bold tracking-tight sm:text-2xl">
          Open roles
        </h2>
        {opportunities.length === 0 ? (
          <EmptyState
            icon={<HandHeart className="size-5" aria-hidden />}
            title="No open roles right now"
            description="We still want to hear from you. Send us a note about the skills you'd like to share and we'll get in touch when a matching role opens."
            action={
              <Button asChild size="sm">
                <Link href="/about/contact">Get in touch</Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {opportunities.map((o) => (
              <Card
                key={o.id}
                className="flex flex-col transition-shadow hover:shadow-md"
              >
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={RISK_TONE[o.riskLevel]}>{o.riskLevel} risk</Badge>
                    {o.requiresTraining && (
                      <Badge tone="info">Training provided</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base">{o.title}</CardTitle>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                    {o.purpose}
                  </p>
                  <dl className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                    {o.commitment && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 shrink-0" aria-hidden />
                        <dt className="sr-only">{t("commitment")}</dt>
                        <dd>{o.commitment}</dd>
                      </div>
                    )}
                    {o.locationName && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <dt className="sr-only">Location</dt>
                        <dd>{o.locationName}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href={`/volunteer/apply/${o.slug}`}>{t("applyNow")}</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
