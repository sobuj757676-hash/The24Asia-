import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { getAllEvents, getEventRegistrationCounts } from "@/server/queries/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminEvents({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("event:manage");

  const events = await getAllEvents();
  const counts = await Promise.all(
    events.map(async (e) => ({
      id: e.id,
      n: await getEventRegistrationCounts(e.id),
    })),
  );
  const countMap = new Map(counts.map((c) => [c.id, c.n]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Events</h1>
      {events.length === 0 ? (
        <EmptyState title="No events yet" />
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{e.title}</CardTitle>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDate(e.startsAt, locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {e.locationName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted)]">
                    {countMap.get(e.id) ?? 0} registered
                  </span>
                  <Badge>{e.status.replace(/_/g, " ")}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
