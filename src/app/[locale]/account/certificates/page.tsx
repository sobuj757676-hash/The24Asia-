import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { getMyCertificates } from "@/server/queries/portal";
import { formatDate } from "@/lib/utils";

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
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t("myCertificates")}</h1>
      {certs.length === 0 ? (
        <EmptyState title={t("noData")} />
      ) : (
        certs.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">{c.courseTitle}</CardTitle>
                <p className="text-sm text-[var(--muted)]">
                  Issued {formatDate(c.issuedAt, locale)} · Code:{" "}
                  <Link
                    href={`/verify?code=${c.verificationCode}`}
                    className="font-mono text-brand-700"
                  >
                    {c.verificationCode}
                  </Link>
                </p>
              </div>
              {c.revokedAt ? (
                <Badge tone="danger">Revoked</Badge>
              ) : (
                <Badge tone="success">Valid</Badge>
              )}
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
