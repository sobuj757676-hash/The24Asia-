import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section, EmptyState, Badge } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { getFlag, FLAGS } from "@/lib/flags";
import { listActiveGroups } from "@/server/queries/community";

export const metadata = { title: "Community" };

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const enabled = await getFlag(FLAGS.COMMUNITY);
  const groups = enabled ? await listActiveGroups() : [];

  return (
    <Section>
      <Container>
        <h1 className="text-3xl font-extrabold">Community</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">
          Moderated groups where members support each other. Please be kind and
          keep personal contact details private.
        </p>

        {!enabled ? (
          <div className="mt-8">
            <EmptyState title="Community is not open yet" body="Check back soon." />
          </div>
        ) : groups.length === 0 ? (
          <div className="mt-8"><EmptyState title="No groups yet" /></div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Link key={g.id} href={`/community/${g.slug}`}>
                <Card className="h-full transition-colors hover:border-brand-400">
                  <CardBody>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{g.name}</CardTitle>
                      {g.preModerate && <Badge>Moderated</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{g.purpose}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
