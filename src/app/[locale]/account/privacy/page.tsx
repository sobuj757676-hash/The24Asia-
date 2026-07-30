import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { person } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { requestAccountClosure } from "@/server/actions/learner";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-dialog";
import { Download, ShieldCheck, UserX } from "lucide-react";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [p] = await db.select().from(person).where(eq(person.id, user.personId)).limit(1);
  const closureRequested = !!p?.deletedAt;

  return (
    <>
      <PageHeader
        title="Privacy & data"
        description="Your data belongs to you. You can take a copy at any time, or ask us to close your account."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="flex h-full flex-col">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
              <Download className="size-5" aria-hidden />
            </span>
            <h2 className="mt-3 font-semibold">Download my data</h2>
            <p className="mt-1 flex-1 text-sm text-[var(--muted)]">
              A portable copy of your profile, course applications and enrolments, event
              registrations, certificates, consents and volunteer hours. It never includes other
              people&apos;s information or internal staff notes.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <a href="/api/account/export" download>
                  <Download className="size-4" aria-hidden /> Export my data (JSON)
                </a>
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex h-full flex-col">
            <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30">
              <UserX className="size-5" aria-hidden />
            </span>
            <h2 className="mt-3 font-semibold">Close my account</h2>
            {closureRequested ? (
              <>
                <p className="mt-2">
                  <Badge tone="warning">Closure requested</Badge>
                </p>
                <p className="mt-2 flex-1 text-sm text-[var(--muted)]">
                  We&apos;re processing your request. Some records may be kept for a limited period
                  where the law requires it, then deleted or anonymised. Contact us if you change
                  your mind.
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 flex-1 text-sm text-[var(--muted)]">
                  This starts the closure process. Records we must keep for legal or financial
                  reasons are retained for a limited period, then deleted or anonymised. You can
                  still reach urgent-help information without an account.
                </p>
                <div className="mt-4">
                  <ConfirmAction
                    action={requestAccountClosure}
                    triggerLabel="Request account closure"
                    triggerVariant="danger"
                    size="md"
                    title="Request account closure?"
                    description="Your access will be withdrawn and your records scheduled for deletion or anonymisation. Download your data first if you want a copy."
                    confirmLabel="Request closure"
                    destructive
                    successMessage="Closure requested — we'll be in touch"
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardBody className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">How we handle your information</p>
            <p className="mt-1 text-[var(--muted)]">
              We collect the minimum we need to run our programs, we never sell your data, and we
              don&apos;t use it for advertising. Sensitive support conversations are kept separate
              from general records and are only seen by trained staff.
            </p>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
