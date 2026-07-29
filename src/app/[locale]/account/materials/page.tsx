import { setRequestLocale } from "next-intl/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { materialsForPerson } from "@/server/queries/learning";

export default async function LearnerMaterials({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();
  const materials = await materialsForPerson(user.personId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Course materials</h1>
      {materials.length === 0 ? (
        <EmptyState title="No materials yet" body="Materials for your courses will appear here." />
      ) : (
        materials.map((m) => (
          <Card key={m.id}>
            <CardBody className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{m.title}</p>
                {m.description && <p className="text-sm text-[var(--muted)]">{m.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {m.offlineAllowed && <Badge tone="brand">Offline</Badge>}
                {m.url && (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-700">
                    Open →
                  </a>
                )}
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
