import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { Card, CardBody } from "@/components/ui/card";
import { FlagToggle } from "@/components/admin/flag-toggle";
import { getFlags } from "@/server/queries/admin";

export default async function AdminFlags({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requirePermission("feature_flag:manage");
  const flags = await getFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Feature flags</h1>
        <p className="text-[var(--muted)]">
          High-risk capabilities stay disabled until their governance decision
          passes (PRD §30.2). Enabling a flag is audited.
        </p>
      </div>
      <div className="space-y-2">
        {flags.map((f) => (
          <Card key={f.key}>
            <CardBody className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm font-semibold">{f.key}</p>
                <p className="text-sm text-[var(--muted)]">{f.description}</p>
                {f.gateReason && (
                  <p className="mt-1 text-xs text-amber-700">{f.gateReason}</p>
                )}
              </div>
              <FlagToggle flagKey={f.key} enabled={f.enabled} />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
