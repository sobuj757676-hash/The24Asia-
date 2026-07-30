import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { materialsForPerson } from "@/server/queries/learning";
import { FileText, ExternalLink, WifiOff } from "lucide-react";

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
    <>
      <PageHeader
        title="Course materials"
        description="Handouts and resources for your courses. Items marked “available offline” stay readable once you've opened them, even without data."
      />

      {materials.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" aria-hidden />}
          title="No materials yet"
          description="Your trainer will add handouts and resources for your courses here."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/account/courses">View my courses</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {materials.map((m) => (
            <li key={m.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                      <FileText className="size-5" aria-hidden />
                    </span>
                    {m.offlineAllowed && (
                      <Badge tone="info">
                        <WifiOff className="size-3" aria-hidden /> Offline
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-3 font-semibold">{m.title}</h2>
                  {m.description && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{m.description}</p>
                  )}
                  {m.url && (
                    <div className="mt-4 pt-1">
                      <Button asChild size="sm" variant="outline">
                        <a href={m.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="size-4" aria-hidden />
                          {m.downloadable ? "Open / download" : "Open"}
                        </a>
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
