import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody } from "@/components/ui/card";
import { getPathwayBySlug } from "@/server/queries/learning";

export default async function PathwayDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const data = await getPathwayBySlug(slug);
  if (!data) notFound();
  const { path, steps } = data;

  return (
    <Section>
      <Container className="max-w-2xl">
        <Link href="/learn/pathways" className="text-sm text-brand-700">← Pathways</Link>
        <h1 className="mt-3 text-3xl font-extrabold">{path.title}</h1>
        {path.description && <p className="mt-2 text-[var(--muted)]">{path.description}</p>}
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={s.step.id}>
              <Card>
                <CardBody className="flex items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                    {i + 1}
                  </span>
                  <Link href={`/learn/${s.course.slug}`} className="font-medium hover:text-brand-700">
                    {s.course.title}
                  </Link>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
