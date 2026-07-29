import { setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { markNotificationRead, markAllRead } from "@/server/actions/comms";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { PushToggle } from "@/components/portal/push-toggle";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const items = await db
    .select()
    .from(notification)
    .where(eq(notification.personId, user.personId))
    .orderBy(desc(notification.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Notifications</h1>
        <div className="flex items-center gap-2">
          <PushToggle />
          <form action={markAllRead}>
            <Button type="submit" size="sm" variant="ghost">Mark all read</Button>
          </form>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No notifications yet" />
      ) : (
        <div className="space-y-2">
          {items.map((nItem) => (
            <Card key={nItem.id}>
              <CardBody className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{nItem.title}</p>
                    {!nItem.readAt && <Badge tone="brand">New</Badge>}
                  </div>
                  {nItem.body && <p className="mt-1 text-sm text-[var(--muted)]">{nItem.body}</p>}
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDate(nItem.createdAt, locale, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                {!nItem.readAt && (
                  <form action={markNotificationRead.bind(null, nItem.id)}>
                    <Button type="submit" size="sm" variant="ghost">Mark read</Button>
                  </form>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
