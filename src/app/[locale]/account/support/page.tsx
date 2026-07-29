import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { mySupportRequests } from "@/server/queries/support";
import { getFlag, FLAGS } from "@/lib/flags";
import { formatDate } from "@/lib/utils";

export default async function AccountSupport({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const [requests, enabled] = await Promise.all([
    mySupportRequests(user.personId),
    getFlag(FLAGS.SUPPORT_INTAKE),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Support</h1>
        {enabled && (
          <Button asChild size="sm">
            <Link href="/support/request">New request</Link>
          </Button>
        )}
      </div>
      {requests.length === 0 ? (
        <EmptyState
          title="No support requests"
          body="Reviewed wellbeing and career resources are available on the public support page."
        />
      ) : (
        requests.map((r) => (
          <Card key={r.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.topic ?? "Support request"}</p>
                <p className="text-sm text-[var(--muted)]">
                  {formatDate(r.createdAt, locale)}
                </p>
              </div>
              <Badge tone={r.status === "completed" ? "success" : "neutral"}>
                {r.status.replace(/_/g, " ")}
              </Badge>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
