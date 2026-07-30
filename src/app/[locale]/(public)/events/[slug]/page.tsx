import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getEventBySlug } from "@/server/queries/public";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEventBySlug(slug);
  return { title: e?.title ?? "Event" };
}

export default async function EventDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("events");
  const tc = await getTranslations("common");
  const e = await getEventBySlug(slug);
  if (!e) notFound();

  const canRegister = ["published", "registration_open"].includes(e.status);

  return (
    <Section>
      <Container className="max-w-3xl">
        <Link href="/events" className="text-sm text-brand-700">
          ← {tc("back")}
        </Link>
        <Badge tone="brand" className="mt-3">
          {e.category.replace(/_/g, " ")}
        </Badge>
        <h1 className="mt-3 text-3xl font-extrabold">{e.title}</h1>

        <div className="mt-4 space-y-2">
          <p className="flex items-center gap-2 text-[var(--muted)]">
            <CalendarDays className="size-5" aria-hidden />
            {formatDate(e.startsAt, locale, {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </p>
          {e.locationName && (
            <p className="flex items-center gap-2 text-[var(--muted)]">
              <MapPin className="size-5" aria-hidden />
              {e.locationName}
            </p>
          )}
        </div>

        {e.description && (
          <p className="mt-6 whitespace-pre-wrap leading-relaxed">
            {e.description}
          </p>
        )}
        {e.whatToBring && (
          <div className="mt-6 rounded-xl border bg-brand-50 p-4 dark:bg-brand-900/20">
            <h2 className="font-semibold">{t("whatToBring")}</h2>
            <p className="mt-1 text-sm">{e.whatToBring}</p>
          </div>
        )}

        <div className="mt-8">
          {canRegister ? (
            <Button asChild size="lg">
              <Link href={`/events/register/${e.id}`}>{t("register")}</Link>
            </Button>
          ) : (
            <Badge>{e.status.replace(/_/g, " ")}</Badge>
          )}
        </div>
      </Container>
    </Section>
  );
}
