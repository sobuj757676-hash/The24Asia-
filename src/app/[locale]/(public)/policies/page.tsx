import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, EmptyState } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
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
        <h1 className="text-3xl font-extrabold">Policies</h1>
        <p className="mt-2 text-[var(--muted)]">Our governance and safeguarding policies.</p>
        {policies.length === 0 ? (
          <div className="mt-8"><EmptyState title="No policies published yet" /></div>
        ) : (
          <div className="mt-6 space-y-2">
            {policies.map((p) => (
              <Link key={p.id} href={`/policies/${p.slug}`}>
                <Card className="transition-colors hover:border-brand-400">
                  <CardBody className="flex items-center justify-between">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-xs text-[var(--muted)]">v{p.version}</span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
