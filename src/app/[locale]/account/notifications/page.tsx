import { setRequestLocale } from "next-intl/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notification } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { markNotificationRead, markAllRead } from "@/server/actions/comms";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { PushToggle } from "@/components/portal/push-toggle";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";

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

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.`
            : "You're all caught up."
        }
        actions={
          <>
            <PushToggle />
            {unread > 0 && (
              <form action={markAllRead}>
                <SubmitButton variant="ghost" pendingLabel="Marking…">
                  Mark all read
                </SubmitButton>
              </form>
            )}
          </>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border bg-[var(--card)] p-4 text-sm">
        <Bell className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
        <p className="text-[var(--muted)]">
          You control what we send you. Choose topics and channels in{" "}
          <Link href="/account/preferences" className="font-medium text-brand-700 dark:text-brand-300 hover:underline">
            preferences
          </Link>
          . We keep message previews discreet so they don&apos;t reveal your circumstances.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<BellOff className="size-5" aria-hidden />}
          title="No notifications yet"
          description="We'll let you know about class changes, application decisions and certificates."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Card className={!n.readAt ? "border-brand-300 dark:border-brand-800" : undefined}>
                <CardBody className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {n.title}
                      {!n.readAt && <Badge tone="brand">New</Badge>}
                    </p>
                    {n.body && <p className="mt-1 text-sm text-[var(--muted)]">{n.body}</p>}
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDate(n.createdAt, locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {n.linkUrl && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={n.linkUrl}>Open</Link>
                      </Button>
                    )}
                    {!n.readAt && (
                      <form action={markNotificationRead.bind(null, n.id)}>
                        <SubmitButton variant="ghost" pendingLabel="…">
                          Mark read
                        </SubmitButton>
                      </form>
                    )}
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
