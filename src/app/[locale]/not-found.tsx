import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search } from "lucide-react";

const SUGGESTIONS = [
  { href: "/learn", label: "Free courses" },
  { href: "/events", label: "Upcoming events" },
  { href: "/volunteer", label: "Volunteer roles" },
  { href: "/support", label: "Get support" },
];

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <Section>
      <Container className="max-w-lg">
        <div className="text-center">
          <p className="text-6xl font-extrabold text-brand-600">404</p>
          <h1 className="mt-4 text-2xl font-bold">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-[var(--muted)]">{t("notFoundBody")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">{t("goHome")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/search">
                <Search className="size-4" aria-hidden />
                {t("search")}
              </Link>
            </Button>
          </div>
        </div>

        {/* A dead end is a bad place to leave someone — offer the popular routes. */}
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            Popular pages
          </p>
          <ul className="mt-3 divide-y overflow-hidden rounded-2xl border bg-[var(--card)]">
            {SUGGESTIONS.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  {s.label}
                  <ChevronRight
                    className="size-4 shrink-0 text-[var(--muted)]"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
