import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/misc";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default async function OfflinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");
  return (
    <Section>
      <Container className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-ink-100 text-ink-600 dark:bg-ink-800">
          <WifiOff className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{t("offline")}</h1>
        <p className="mt-2 text-[var(--muted)]">
          Some saved pages are still available. Reconnect to see the latest
          schedules and updates.
        </p>
      </Container>
    </Section>
  );
}
