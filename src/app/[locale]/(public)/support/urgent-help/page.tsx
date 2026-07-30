import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { Phone, ExternalLink } from "lucide-react";
import { getUrgentHelpServices } from "@/server/queries/public";

export const metadata = { title: "Urgent help", robots: { index: false } };

export default async function UrgentHelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const services = await getUrgentHelpServices();

  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-extrabold">{t("urgentTitle")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("urgentBody")}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{t("notEmergency")}</p>

        <div className="mt-6 space-y-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-2xl border bg-[var(--card)] p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{s.name}</h2>
                <Badge tone="danger">24/7</Badge>
              </div>
              {s.description && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {s.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {s.contactPhone && (
                  <a
                    href={`tel:${s.contactPhone}`}
                    className="flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-300"
                  >
                    <Phone className="size-4" aria-hidden /> {s.contactPhone}
                  </a>
                )}
                {s.contactUrl && (
                  <a
                    href={s.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-medium text-brand-700 dark:text-brand-300"
                  >
                    <ExternalLink className="size-4" aria-hidden /> Website
                  </a>
                )}
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              Emergency: dial 995 (ambulance/fire) or 999 (police) in Singapore.
              National mindline: 1771.
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}
