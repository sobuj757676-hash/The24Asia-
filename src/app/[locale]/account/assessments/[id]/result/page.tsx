import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata = { robots: { index: false } };

export default async function AssessmentResult({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ score?: string; passed?: string }>;
}) {
  const { locale } = await params;
  const { score, passed } = await searchParams;
  setRequestLocale(locale);
  const didPass = passed === "true";

  return (
    <Section>
      <Container className="max-w-md text-center">
        <span className={`mx-auto grid size-16 place-items-center rounded-full ${didPass ? "bg-brand-100 text-brand-700" : "bg-red-100 text-red-700"}`}>
          {didPass ? <CheckCircle2 className="size-8" /> : <XCircle className="size-8" />}
        </span>
        <h1 className="mt-4 text-2xl font-bold">
          {didPass ? "You passed!" : "Not passed yet"}
        </h1>
        <p className="mt-2 text-3xl font-extrabold text-brand-600">{score}%</p>
        <p className="mt-2 text-[var(--muted)]">
          {didPass
            ? "Great work. Your trainer will confirm your certificate."
            : "You can review the material and try again."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/account/assessments">Back to assessments</Link>
        </Button>
      </Container>
    </Section>
  );
}
