import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, ExternalLink } from "lucide-react";
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
        <h1 className="text-3xl font-extrabold">{t("title")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("intro")}</p>

        {/* Urgent help - reachable in one action (PRD SUP-003) */}
        <div className="mt-6 rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-5">
          <div className="flex items-center gap-2 text-accent-600">
            <AlertTriangle className="size-5" aria-hidden />
            <h2 className="font-bold">{t("urgentTitle")}</h2>
          </div>
          <p className="mt-2 text-sm">{t("urgentBody")}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{t("notEmergency")}</p>
          <Button asChild variant="accent" size="sm" className="mt-3">
            <Link href="/support/urgent-help">{t("urgentTitle")}</Link>
          </Button>
        </div>

        {/* Private contact request (enabled when staffed coverage is configured) */}
        {intakeEnabled ? (
          <div className="mt-6 rounded-xl border bg-brand-50 p-4 dark:bg-brand-900/20">
            <h2 className="font-semibold">Request a private conversation</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              A trained team member will reach out using your preferred contact
              method.
            </p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/support/request">Request contact</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border bg-ink-50 p-4 text-sm text-[var(--muted)] dark:bg-ink-800">
            {t("requestContactDisabled")}
          </div>
        )}

        <div className="mt-4">
          <Link href="/careers" className="text-sm font-medium text-brand-700">
            Career & job opportunities →
          </Link>
        </div>

        <h2 className="mt-8 text-xl font-bold">{t("resourcesTitle")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex items-center gap-2">
                  <Badge>{s.topic}</Badge>
                  {s.isUrgentHelp && <Badge tone="danger">Urgent</Badge>}
                </div>
                <CardTitle className="mt-2 text-base">{s.name}</CardTitle>
                {s.description && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {s.description}
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-1 text-sm">
                  {s.contactPhone && (
                    <a
                      href={`tel:${s.contactPhone}`}
                      className="flex items-center gap-1.5 text-brand-700"
                    >
                      <Phone className="size-4" aria-hidden /> {s.contactPhone}
                    </a>
                  )}
                  {s.contactUrl && (
                    <a
                      href={s.contactUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-brand-700"
                    >
                      <ExternalLink className="size-4" aria-hidden /> Website
                    </a>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
