import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, EmptyState } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPublic } from "@/server/queries/public";

export const metadata = { title: "Search" };

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
  const results = q && q.trim().length >= 2 ? await searchPublic(q.trim()) : null;

  const groups = results
    ? [
        { heading: "Courses", items: results.courses.map((c) => ({ label: c.title, href: `/learn/${c.slug}` })) },
        { heading: "Events", items: results.events.map((e) => ({ label: e.title, href: `/events/${e.slug}` })) },
        { heading: "Volunteer roles", items: results.opps.map((o) => ({ label: o.title, href: `/volunteer/apply/${o.slug}` })) },
        { heading: "Stories", items: results.stories.map((s) => ({ label: s.title, href: `/stories/${s.slug}` })) },
        { heading: "Services", items: results.services.map((s) => ({ label: s.name, href: `/support` })) },
      ].filter((g) => g.items.length > 0)
    : [];

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-extrabold">Search</h1>
        <form method="get" className="mt-4 flex gap-2">
          <Input name="q" defaultValue={q} placeholder="Search programs, events, resources…" aria-label="Search" />
          <Button type="submit">Search</Button>
        </form>

        {results && (
          <div className="mt-8">
            {total === 0 ? (
              <EmptyState title="No results" body="Try different words or browse from the menu." />
            ) : (
              <div className="space-y-6">
                {groups.map((g) => (
                  <div key={g.heading}>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">{g.heading}</h2>
                    <ul className="mt-2 divide-y rounded-xl border bg-[var(--card)]">
                      {g.items.map((it, i) => (
                        <li key={i}>
                          <Link href={it.href} className="block px-4 py-3 hover:bg-ink-100 dark:hover:bg-ink-800">
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
