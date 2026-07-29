import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <Section>
      <Container className="max-w-lg text-center">
        <p className="text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("notFoundBody")}</p>
        <Button asChild className="mt-6">
          <Link href="/">{t("goHome")}</Link>
        </Button>
      </Container>
    </Section>
  );
}
