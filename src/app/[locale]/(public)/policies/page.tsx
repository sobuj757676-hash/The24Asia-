import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Button } from "@/components/ui/button";
import { ChevronRight, ScrollText } from "lucide-react";
import { listPublishedPolicies } from "@/server/queries/public";

export const metadata = { title: "Policies" };

export default async function PoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const policies = await listPublishedPolicies();

  return (
    <Section>
      <Container className="max-w-2xl">
        <PageIntro
          title="Policies"
          description="How we govern ourselves: safeguarding, privacy, data protection and complaints. Published in full, because trust has to be earned."
          className="mb-6"
        />

        {policies.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="size-5" aria-hidden />}
            title="No policies published yet"
            description="Our policy documents are being finalised for publication. If you need a specific policy now, ask us and we'll send it to you."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/about/contact">Request a policy</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y overflow-hidden rounded-2xl border bg-[var(--card)]">
            {policies.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/policies/${p.slug}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
                >
                  <span className="min-w-0 font-medium">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-[var(--muted)]">
                    Version {p.version}
                    <ChevronRight className="size-4" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
