import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

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
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300">
          <WifiOff className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">{t("offline")}</h1>
        <p className="mt-2 text-[var(--muted)]">
          You&apos;re not connected right now. Pages you&apos;ve already opened are still
          available, and any course material marked for offline use stays on your
          device.
        </p>

        {/*
          A server component cannot call location.reload(), and a whole client
          component for one button is overkill — an anchor to the current page
          re-requests it, which is exactly what "try again" should do.
        */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/offline">
              <RefreshCw className="size-4" aria-hidden />
              Try again
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/materials">My saved materials</Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-[var(--muted)]">
          Tip: connect to Wi-Fi when you can to save mobile data — our pages are
          built to be light, but videos and downloads are not.
        </p>
      </Container>
    </Section>
  );
}
