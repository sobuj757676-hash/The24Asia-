import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { getMyCertificates } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";
import { Award, ExternalLink, Printer } from "lucide-react";

export default async function MyCertificatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portal");
  const user = await requireUser();
  const certs = await getMyCertificates(user.personId);

  return (
    <>
      <PageHeader
        title={t("myCertificates")}
        description="Share the verification code with an employer and they can confirm your certificate is genuine — no account needed."
      />

      {certs.length === 0 ? (
        <EmptyState
          icon={<Award className="size-5" aria-hidden />}
          title="No certificates yet"
          description="Complete a course and your trainer will issue a verifiable certificate here."
          action={
            <Button asChild size="sm">
              <Link href="/learn">Browse courses</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <li key={c.id}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                      <Award className="size-5" aria-hidden />
                    </span>
                    {c.revokedAt ? (
                      <Badge tone="danger">Revoked</Badge>
                    ) : (
                      <Badge tone="success">Valid</Badge>
                    )}
                  </div>

                  <h2 className="mt-3 font-semibold">{c.courseTitle}</h2>
                  <p className="text-sm text-[var(--muted)]">
                    Issued {formatDate(c.issuedAt, locale, { dateStyle: "long" })}
                  </p>

                  <div className="mt-3 rounded-xl bg-ink-50 px-3 py-2 dark:bg-ink-800/60">
                    <p className="text-xs text-[var(--muted)]">Verification code</p>
                    <p className="font-mono text-sm font-semibold tracking-wide">
                      {c.verificationCode}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <Button asChild size="sm">
                      <Link href={`/certificate/${c.verificationCode}`}>
                        <Printer className="size-4" aria-hidden /> View &amp; print
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/verify?code=${c.verificationCode}`}>
                        <ExternalLink className="size-4" aria-hidden /> Verify page
                      </Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
