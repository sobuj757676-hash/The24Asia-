import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { listPathwaysPublished } from "@/server/queries/learning";

export const metadata = { title: "Learning pathways" };

export default async function PathwaysPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const pathways = await listPathwaysPublished();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">Learning pathways</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">
          Follow a recommended sequence of courses to build toward a goal.
        </p>
        {pathways.length === 0 ? (
          <div className="mt-8"><EmptyState title="No pathways published yet" /></div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((p) => (
              <Link key={p.id} href={`/learn/pathways/${p.slug}`}>
                <Card className="h-full transition-colors hover:border-brand-400">
                  <CardBody>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="mt-1 text-sm text-[var(--muted)]">{p.description}</p>
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
