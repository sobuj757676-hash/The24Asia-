import { setRequestLocale } from "next-intl/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { person } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { requestAccountClosure } from "@/server/actions/learner";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { Download } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Privacy & data</h1>
        <p className="text-[var(--muted)]">
          You control your data. Under Singapore PDPA you can access a copy and
          request closure of your account.
        </p>
      </div>

      <Card>
        <CardBody>
          <h2 className="font-semibold">Download my data</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A portable JSON copy of your profile, registrations, consents and
            achievements. It excludes other people&apos;s data.
          </p>
          <Button asChild className="mt-3" variant="outline">
            <a href="/api/account/export" download>
              <Download className="size-4" aria-hidden /> Export my data
            </a>
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-semibold">Close my account</h2>
          {closureRequested ? (
            <p className="mt-2 text-sm">
              <Badge tone="warning">Closure requested</Badge>{" "}
              <span className="text-[var(--muted)]">
                Your request is being processed. Some records may be retained
                where required by law before deletion.
              </span>
            </p>
          ) : (
            <form action={requestAccountClosure} className="mt-2">
              <p className="text-sm text-[var(--muted)]">
                This starts the closure process. Records required for legal or
                financial obligations may be retained for a limited period, then
                deleted or anonymised.
              </p>
              <Button type="submit" variant="danger" className="mt-3">
                Request account closure
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
