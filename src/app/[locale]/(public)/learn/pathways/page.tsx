import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Route } from "lucide-react";
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
      <Container size="wide">
        <PageIntro
          title="Learning pathways"
          description="Not sure where to start? A pathway is a recommended order of courses that builds towards a goal — finish one step and the next is waiting."
          actions={
            <Button asChild variant="outline">
              <Link href="/learn">Browse individual courses</Link>
            </Button>
          }
        />

        {pathways.length === 0 ? (
          <EmptyState
            icon={<Route className="size-5" aria-hidden />}
            title="No pathways published yet"
            description="We're mapping our courses into guided pathways. In the meantime every course can be taken on its own."
            action={
              <Button asChild size="sm">
                <Link href="/learn">See all courses</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((p) => (
              <Link
                key={p.id}
                href={`/learn/pathways/${p.slug}`}
                className="group block h-full"
              >
                <Card className="h-full transition-all hover:border-brand-400 hover:shadow-md">
                  <CardBody className="flex h-full flex-col">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                      <Route className="size-5" aria-hidden />
                    </span>
                    <CardTitle className="mt-3 text-base">{p.title}</CardTitle>
                    {p.description && (
                      <p className="mt-1.5 flex-1 text-sm text-[var(--muted)]">
                        {p.description}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                      View pathway
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
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
