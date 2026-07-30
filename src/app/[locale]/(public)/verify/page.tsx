import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { PageIntro } from "@/components/ui/page-intro";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { CheckCircle2, XCircle, ScanLine } from "lucide-react";
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

  const trimmed = code?.trim();
  const result = trimmed ? await verifyCertificate(trimmed) : undefined;

  return (
    <Section>
      <Container className="max-w-xl">
        <PageIntro
          title={t("verifyTitle")}
          description={t("verifyIntro")}
          className="mb-6"
        />

        <Card>
          <CardBody>
            <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Field
                  label={t("verifyCode")}
                  htmlFor="code"
                  hint="Printed on the certificate, e.g. 24A-2026-AB12CD"
                >
                  <Input
                    id="code"
                    name="code"
                    defaultValue={trimmed}
                    placeholder="24A-2026-AB12CD"
                    autoComplete="off"
                    spellCheck={false}
                    className="font-mono uppercase"
                  />
                </Field>
              </div>
              <Button type="submit" className="sm:mb-0">
                <ScanLine className="size-4" aria-hidden />
                Verify
              </Button>
            </form>
          </CardBody>
        </Card>

        {result !== undefined && (
          <div className="mt-6" aria-live="polite">
            {result && !result.revokedAt ? (
              <div className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-5 dark:bg-brand-900/20">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
                  <CheckCircle2 className="size-6 shrink-0" aria-hidden />
                  <h2 className="text-lg font-bold">{t("verifyValid")}</h2>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold">Name:</dt>
                    <dd>{result.recipientName}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold">Course:</dt>
                    <dd>{result.courseTitle}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold">Issued:</dt>
                    <dd>{formatDate(result.issuedAt, locale)}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-semibold">Code:</dt>
                    <dd className="font-mono">{result.verificationCode}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-danger">
                  <XCircle className="size-6 shrink-0" aria-hidden />
                  <h2 className="text-lg font-bold">{t("verifyInvalid")}</h2>
                </div>
                {result?.revokedAt ? (
                  <div className="mt-3 text-sm">
                    <Badge tone="danger">Revoked</Badge>
                    <p className="mt-2">
                      This certificate was issued but has since been revoked on{" "}
                      {formatDate(result.revokedAt, locale)}. Please contact us if you
                      believe this is an error.
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm">
                    We couldn&apos;t find a certificate with that code. Check for typing
                    mistakes — the code is a mix of letters and numbers — or{" "}
                    <Link href="/about/contact" className="font-medium underline">
                      contact us
                    </Link>{" "}
                    and we&apos;ll help.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-8 text-sm text-[var(--muted)]">
          Employers: every 24Asia certificate has a unique code that can be checked
          here at any time, free of charge. We only show the learner&apos;s name, the
          course and the issue date.
        </p>
      </Container>
    </Section>
  );
}
