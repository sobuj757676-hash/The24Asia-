import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { getPublishedProducts } from "@/server/queries/public";
import { formatMoney } from "@/lib/utils";

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
        <PageIntro
          title="Shop"
          description="24Asia merchandise, made to be worn with pride. Every purchase funds our free training and community programmes."
        />

        {products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" aria-hidden />}
            title="No products available yet"
            description="Our next merchandise run is being prepared. If you'd like to support us today, a donation goes directly to programmes."
            action={
              <Button asChild size="sm">
                <Link href="/donate">
                  <Heart className="size-4" aria-hidden />
                  Donate instead
                </Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {products.map((p) => (
              <Card
                key={p.id}
                className="flex flex-col transition-shadow hover:shadow-md"
              >
                <CardBody className="flex flex-1 flex-col">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.description && (
                    <p className="mt-1.5 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                      {p.description}
                    </p>
                  )}
                  <p className="mt-3 text-lg font-bold text-brand-600">
                    {formatMoney(p.priceCents, p.currency ?? "SGD", locale)}
                  </p>
                  <div className="mt-3">
                    <Button asChild size="sm">
                      <Link href={`/shop/${p.slug}`}>View item</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
