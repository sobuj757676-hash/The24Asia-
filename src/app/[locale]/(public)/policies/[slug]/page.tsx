import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { getPolicyBySlug } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPolicyBySlug(slug);
  return { title: p?.title ?? "Policy" };
}

export default async function PolicyDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getPolicyBySlug(slug);
  if (!p) notFound();

  return (
    <Section>
      <Container className="max-w-2xl">
        <Link href="/policies" className="text-sm text-brand-700 dark:text-brand-300">← Policies</Link>
        <h1 className="mt-3 text-3xl font-extrabold">{p.title}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Version {p.version}
          {p.effectiveAt ? ` · effective ${formatDate(p.effectiveAt, locale)}` : ""}
        </p>
        {p.body && <div className="mt-6 whitespace-pre-wrap leading-relaxed">{p.body}</div>}
      </Container>
    </Section>
  );
}
