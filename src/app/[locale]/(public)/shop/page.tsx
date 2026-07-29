import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, EmptyState } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPublishedProducts } from "@/server/queries/public";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await getPublishedProducts();

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">Shop</h1>
        <p className="mt-2 text-[var(--muted)]">
          24Asia merchandise. Proceeds support our free programs.
        </p>
        {products.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No products available yet" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id}>
                <CardBody>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.description}</p>
                  <p className="mt-2 font-bold text-brand-600">
                    S${(p.priceCents / 100).toFixed(2)}
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <Link href={`/shop/${p.slug}`}>View</Link>
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
