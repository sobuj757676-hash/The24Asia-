import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataList, type Column } from "@/components/ui/data-list";
import { Award, BadgeCheck, ShieldOff } from "lucide-react";
import { ActionButton } from "@/components/admin/row-actions";
import { enrollmentsForCerts, listCertificates } from "@/server/queries/learning";
import { issueCertificate, revokeCertificate } from "@/server/actions/learning-manage";
import { formatDate } from "@/lib/utils";

type Cert = Awaited<ReturnType<typeof listCertificates>>[number];

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

  const revoked = certs.filter((c) => c.revokedAt);

  const columns: Column<Cert>[] = [
    {
      key: "recipient",
      label: "Recipient",
      primary: true,
      render: (c) => (
        <div className="min-w-0">
          <span className="font-medium">{c.recipientName}</span>
          <span className="block text-xs text-[var(--muted)]">{c.courseTitle}</span>
        </div>
      ),
    },
    {
      key: "code",
      label: "Verification code",
      render: (c) => (
        <Link
          href={`/certificate/${c.verificationCode}`}
          className="font-mono text-xs text-brand-700 dark:text-brand-300 underline-offset-2 hover:underline"
        >
          {c.verificationCode}
        </Link>
      ),
    },
    {
      key: "issued",
      label: "Issued",
      render: (c) => formatDate(c.issuedAt, locale),
    },
    {
      key: "status",
      label: "Status",
      align: "right",
      render: (c) => <StatusBadge status={c.revokedAt ? "revoked" : "valid"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (c) =>
        c.revokedAt ? (
          <span className="text-xs text-[var(--muted)]">
            {formatDate(c.revokedAt, locale)}
          </span>
        ) : (
          <ActionButton
            action={revokeCertificate.bind(null, c.id)}
            label="Revoke"
            variant="danger"
            confirm="Revoke this certificate? Public verification will show it as revoked."
            successMessage="Revoked"
          />
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Issue verifiable certificates to learners who completed their course, and revoke them if needed."
        breadcrumb={
          <Link href="/admin/programs" className="hover:underline">
            ← Programs
          </Link>
        }
      />

      <StatGrid cols={3}>
        <StatCard
          label="Ready to issue"
          value={pending.length}
          hint={pending.length > 0 ? "Completed enrolments awaiting a certificate" : "Nothing waiting"}
          icon={<Award className="size-4" />}
        />
        <StatCard
          label="Issued"
          value={certs.length - revoked.length}
          icon={<BadgeCheck className="size-4" />}
        />
        <StatCard
          label="Revoked"
          value={revoked.length}
          icon={<ShieldOff className="size-4" />}
          tone="neutral"
        />
      </StatGrid>

      <div className="mt-8 space-y-8">
        <section>
          <SectionHeader
            title="Awaiting issue"
            description="Learners who finished their course and have no certificate yet."
          />
          {pending.length === 0 ? (
            <EmptyState
              compact
              icon={<Award className="size-5" aria-hidden />}
              title="No eligible enrolments"
              description="Certificates appear here once a learner completes a course or passes its assessment."
            />
          ) : (
            <ul className="space-y-2">
              {pending.map((e) => (
                <li key={e.enrollmentId}>
                  <Card>
                    <CardBody className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{e.personName ?? "Learner"}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {e.courseTitle} · cohort {e.code}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={e.status} />
                        <ActionButton
                          action={issueCertificate.bind(null, e.enrollmentId)}
                          label="Issue certificate"
                          successMessage="Certificate issued"
                        />
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            title={`Issued certificates (${certs.length})`}
            description="Anyone can verify a certificate with its code at /verify."
          />
          {certs.length === 0 ? (
            <EmptyState
              compact
              icon={<BadgeCheck className="size-5" aria-hidden />}
              title="No certificates issued yet"
              description="Issue your first certificate from the list above."
            />
          ) : (
            <DataList
              columns={columns}
              rows={certs}
              getKey={(c) => c.id}
              caption="Issued certificates"
            />
          )}
        </section>
      </div>
    </>
  );
}
