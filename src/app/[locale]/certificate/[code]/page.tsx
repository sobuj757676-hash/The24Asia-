import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { verifyCertificate } from "@/server/queries/public";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Certificate", robots: { index: false } };

/**
 * Printable certificate view. Standalone (no site chrome) so it prints cleanly.
 * Shows only approved fields (PRD LMS-011).
 */
export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const cert = await verifyCertificate(code);
  if (!cert) notFound();

  const revoked = !!cert.revokedAt;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center p-6">
      <div className="w-full rounded-3xl border-4 border-brand-600 bg-white p-10 text-center text-ink-900 shadow-xl">
        <div className="text-sm font-semibold uppercase tracking-widest text-brand-700">
          24Asia · Certificate of Completion
        </div>
        <p className="mt-8 text-sm text-ink-500">This certifies that</p>
        <h1 className="mt-2 text-4xl font-extrabold">{cert.recipientName}</h1>
        <p className="mt-4 text-sm text-ink-500">has successfully completed</p>
        <h2 className="mt-2 text-2xl font-bold text-brand-700">{cert.courseTitle}</h2>
        <p className="mt-6 text-sm text-ink-500">
          Issued {formatDate(cert.issuedAt, locale, { dateStyle: "long" })}
        </p>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-ink-400">
          <span className="font-mono">{code}</span>
          {revoked && (
            <span className="rounded bg-red-100 px-2 py-0.5 font-semibold text-red-700">
              REVOKED
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-400">
          Verify at 24asia.org/verify
        </p>
      </div>
    </main>
  );
}
