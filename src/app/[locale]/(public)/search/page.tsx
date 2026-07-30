import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search as SearchIcon,
  GraduationCap,
  CalendarDays,
  HandHeart,
  BookOpen,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import { searchPublic } from "@/server/queries/public";

export const metadata = { title: "Search" };

const SUGGESTIONS = [
  { label: "Free courses", href: "/learn" },
  { label: "Upcoming events", href: "/events" },
  { label: "Volunteer roles", href: "/volunteer" },
  { label: "Get support", href: "/support" },
  { label: "Verify a certificate", href: "/verify" },
];

/** Removes duplicates that can appear when an item matched in several locales. */
function dedupe(items: { label: string; href: string }[]) {
  const seen = new Map<string, { label: string; href: string }>();
  for (const item of items) if (!seen.has(item.href)) seen.set(item.href, item);
  return [...seen.values()];
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  setRequestLocale(locale);

  const query = q?.trim() ?? "";
  const tooShort = query.length > 0 && query.length < 2;
  const results = query.length >= 2 ? await searchPublic(query) : null;

  const groups = results
    ? [
        {
          heading: "Courses",
          icon: <GraduationCap className="size-4" aria-hidden />,
          items: dedupe(
            results.courses.map((c) => ({
              label: c.title,
              href: `/learn/${c.slug}`,
            })),
          ),
        },
        {
          heading: "Events",
          icon: <CalendarDays className="size-4" aria-hidden />,
          items: dedupe(
            results.events.map((e) => ({
              label: e.title,
              href: `/events/${e.slug}`,
            })),
          ),
        },
        {
          heading: "Volunteer roles",
          icon: <HandHeart className="size-4" aria-hidden />,
          items: dedupe(
            results.opps.map((o) => ({
              label: o.title,
              href: `/volunteer/apply/${o.slug}`,
            })),
          ),
        },
        {
          heading: "Stories",
          icon: <BookOpen className="size-4" aria-hidden />,
          items: dedupe(
            results.stories.map((s) => ({
              label: s.title,
              href: `/stories/${s.slug}`,
            })),
          ),
        },
        {
          heading: "Support services",
          icon: <LifeBuoy className="size-4" aria-hidden />,
          items: dedupe(
            results.services.map((s) => ({ label: s.name, href: "/support" })),
          ),
        },
      ].filter((g) => g.items.length > 0)
    : [];

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Section>
      <Container className="max-w-2xl">
        <PageIntro
          title="Search"
          description="Find courses, events, volunteer roles, stories and support services."
          className="mb-6"
        />

        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="What are you looking for?" htmlFor="q">
              <Input
                id="q"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Courses, events, resources…"
                autoComplete="off"
              />
            </Field>
          </div>
          <Button type="submit">
            <SearchIcon className="size-4" aria-hidden />
            Search
          </Button>
        </form>

        {tooShort && (
          <p role="alert" className="mt-4 text-sm text-danger-fg">
            Please type at least 2 characters.
          </p>
        )}

        {!results && !tooShort && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Popular
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results && (
          <div className="mt-8" aria-live="polite">
            {total === 0 ? (
              <EmptyState
                icon={<SearchIcon className="size-5" aria-hidden />}
                title={`No results for “${query}”`}
                description="Try a shorter or different word — for example “Excel”, “safety” or “English”. You can also browse using the links below."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.slice(0, 3).map((s) => (
                      <Button key={s.href} asChild size="sm" variant="outline">
                        <Link href={s.href}>{s.label}</Link>
                      </Button>
                    ))}
                  </div>
                }
              />
            ) : (
              <>
                <p className="mb-5 text-sm text-[var(--muted)]">
                  {total} result{total === 1 ? "" : "s"} for “{query}”
                </p>
                <div className="space-y-6">
                  {groups.map((g) => (
                    <section key={g.heading}>
                      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                        {g.icon}
                        {g.heading}
                        <span className="font-normal normal-case">({g.items.length})</span>
                      </h2>
                      <ul className="mt-2 divide-y overflow-hidden rounded-2xl border bg-[var(--card)]">
                        {g.items.map((it) => (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                            >
                              <span className="min-w-0">{it.label}</span>
                              <ChevronRight
                                className="size-4 shrink-0 text-[var(--muted)]"
                                aria-hidden
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
