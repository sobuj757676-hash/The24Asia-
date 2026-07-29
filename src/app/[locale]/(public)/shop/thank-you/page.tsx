import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Order received", robots: { index: false } };

export default async function ShopThankYou({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Section>
      <Container className="max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-extrabold">Order received</h1>
        <p className="mt-2 text-[var(--muted)]">
          Thank you! We&apos;ll confirm pickup or delivery details with you.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </Container>
    </Section>
  );
}
