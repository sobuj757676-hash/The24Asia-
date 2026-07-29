import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ActionButton } from "@/components/admin/row-actions";
import { enrollmentsForCerts, listCertificates } from "@/server/queries/learning";
import { issueCertificate, revokeCertificate } from "@/server/actions/learning-manage";
import { formatDate } from "@/lib/utils";

export default async function AdminCertificates({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("certificate:issue");

  const [pending, certs] = await Promise.all([
    enrollmentsForCerts(),
    listCertificates(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Certificates</h1>
        <Link href="/admin/programs" className="text-sm text-brand-700">← Programs</Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Issue certificate</h2>
        {pending.length === 0 ? (
          <EmptyState title="No eligible enrolments" />
        ) : (
          <div className="space-y-2">
            {pending.map((e) => (
              <Card key={e.enrollmentId}>
                <CardBody className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{e.personName ?? "Learner"}</p>
                    <p className="text-sm text-[var(--muted)]">{e.courseTitle} · {e.code} · {e.status}</p>
                  </div>
                  <ActionButton action={issueCertificate.bind(null, e.enrollmentId)} label="Issue certificate" successMessage="Certificate issued" />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Issued ({certs.length})</h2>
        <div className="space-y-2">
          {certs.map((c) => (
            <Card key={c.id}>
              <CardBody className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.recipientName} · {c.courseTitle}</p>
                  <p className="text-sm text-[var(--muted)]">
                    <Link href={`/certificate/${c.verificationCode}`} className="font-mono text-brand-700">{c.verificationCode}</Link>
                    {" · "}{formatDate(c.issuedAt, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.revokedAt ? <Badge tone="danger">Revoked</Badge> : <Badge tone="success">Valid</Badge>}
                  {!c.revokedAt && (
                    <ActionButton action={revokeCertificate.bind(null, c.id)} label="Revoke" variant="danger" confirm="Revoke certificate?" successMessage="Revoked" />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
