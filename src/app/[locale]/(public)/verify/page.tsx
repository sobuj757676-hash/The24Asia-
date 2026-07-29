import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container, Section, Badge } from "@/components/ui/misc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { verifyCertificate } from "@/server/queries/public";

export const metadata = { title: "Verify a certificate" };

export default async function VerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { locale } = await params;
  const { code } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("learn");

  const result = code ? await verifyCertificate(code) : undefined;

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-3xl font-extrabold">{t("verifyTitle")}</h1>
        <p className="mt-2 text-[var(--muted)]">{t("verifyIntro")}</p>

        <form method="get" className="mt-6 flex gap-2">
          <Input
            name="code"
            defaultValue={code}
            placeholder="e.g. 24A-2026-AB12CD"
            aria-label={t("verifyCode")}
            className="uppercase"
          />
          <Button type="submit">{t("verifyCode")}</Button>
        </form>

        {result !== undefined && (
          <div className="mt-6">
            {result && !result.revokedAt ? (
              <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-5 dark:bg-brand-900/20">
                <div className="flex items-center gap-2 text-brand-700">
                  <CheckCircle2 className="size-6" aria-hidden />
                  <h2 className="text-lg font-bold">{t("verifyValid")}</h2>
                </div>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="font-semibold">Name:</dt>
                    <dd>{result.recipientName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold">Course:</dt>
                    <dd>{result.courseTitle}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold">Issued:</dt>
                    <dd>{formatDate(result.issuedAt, locale)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border p-5 text-danger">
                <XCircle className="size-6" aria-hidden />
                <div>
                  <p className="font-bold">{t("verifyInvalid")}</p>
                  {result?.revokedAt && (
                    <Badge tone="danger" className="mt-1">
                      Revoked
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
