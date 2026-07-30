import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Phone,
  ExternalLink,
  Lock,
  ArrowRight,
  LifeBuoy,
  BriefcaseBusiness,
} from "lucide-react";
import { getPublishedServices } from "@/server/queries/public";
import { getFlag, FLAGS } from "@/lib/flags";

export const metadata = { title: "Get support" };

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const services = await getPublishedServices();
  const intakeEnabled = await getFlag(FLAGS.SUPPORT_INTAKE);

  return (
    <Section>
      <Container className="max-w-3xl">
        <PageIntro title={t("title")} description={t("intro")} className="mb-6" />

        {/* Urgent help — reachable in one action (PRD SUP-003) */}
        <div className="rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-5">
          <div className="flex items-center gap-2 text-accent-600">
            <AlertTriangle className="size-5 shrink-0" aria-hidden />
            <h2 className="font-bold">{t("urgentTitle")}</h2>
          </div>
          <p className="mt-2 text-sm">{t("urgentBody")}</p>
          <p className="mt-1.5 text-xs text-[var(--muted)]">{t("notEmergency")}</p>
          <Button asChild variant="accent" className="mt-4">
            <Link href="/support/urgent-help">
              {t("urgentTitle")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        {/* Private contact request (enabled when staffed coverage is configured) */}
        {intakeEnabled ? (
          <Card className="mt-5 border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-900/20">
            <CardBody>
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <h2 className="font-semibold">Request a private conversation</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    A trained team member will reach out using your preferred contact
                    method. What you tell us stays confidential, and you choose how
                    much to share.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/support/request">Request contact</Link>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border bg-ink-50 p-4 text-sm text-[var(--muted)] dark:bg-ink-800">
            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{t("requestContactDisabled")}</p>
          </div>
        )}

        <div className="mt-5">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 dark:text-brand-300 hover:underline"
          >
            <BriefcaseBusiness className="size-4" aria-hidden />
            Career &amp; job opportunities
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <h2 className="mt-10 mb-4 text-xl font-bold tracking-tight sm:text-2xl">
          {t("resourcesTitle")}
        </h2>
        {services.length === 0 ? (
          <EmptyState
            icon={<LifeBuoy className="size-5" aria-hidden />}
            title="Directory being updated"
            description="Our services directory is being refreshed. If you need help now, use urgent help above and we'll point you to the right organisation."
            action={
              <Button asChild size="sm" variant="accent">
                <Link href="/support/urgent-help">{t("urgentTitle")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <Card key={s.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{s.topic}</Badge>
                    {s.isUrgentHelp && <Badge tone="danger">Urgent</Badge>}
                  </div>
                  <CardTitle className="mt-2.5 text-base">{s.name}</CardTitle>
                  {s.description && (
                    <p className="mt-1.5 flex-1 text-sm text-[var(--muted)]">
                      {s.description}
                    </p>
                  )}
                  <div className="mt-3 flex flex-col gap-1.5 text-sm">
                    {s.contactPhone && (
                      <a
                        href={`tel:${s.contactPhone}`}
                        className="inline-flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-300 hover:underline"
                      >
                        <Phone className="size-4 shrink-0" aria-hidden />
                        {s.contactPhone}
                      </a>
                    )}
                    {s.contactUrl && (
                      <a
                        href={s.contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-300 hover:underline"
                      >
                        <ExternalLink className="size-4 shrink-0" aria-hidden />
                        Visit website
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
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
