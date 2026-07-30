import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Badge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, CardGrid } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ShieldCheck, MessagesSquare } from "lucide-react";
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
        <PageIntro
          title="Community"
          description="Moderated groups where members support each other. Please be kind, and keep personal contact details private."
        />

        <div className="mb-8 flex items-start gap-3 rounded-2xl border bg-ink-50/60 p-4 text-sm dark:bg-ink-800/40">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
          <p>
            <span className="font-semibold">Our house rules. </span>
            Volunteer moderators read every group. Harassment, recruitment fees, money
            lending and sharing someone else&apos;s private information are not allowed.
            You can report any post confidentially.
          </p>
        </div>

        {!enabled ? (
          <EmptyState
            icon={<MessagesSquare className="size-5" aria-hidden />}
            title="Community is not open yet"
            description="We're setting up moderation cover so the space is safe from day one. In the meantime, come and meet people at one of our events."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/events">See upcoming events</Link>
              </Button>
            }
          />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" aria-hidden />}
            title="No groups yet"
            description="The first community groups are being created. Check back soon, or tell us what kind of group you'd find useful."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/about/contact">Suggest a group</Link>
              </Button>
            }
          />
        ) : (
          <CardGrid>
            {groups.map((g) => (
              <Link key={g.id} href={`/community/${g.slug}`} className="block h-full">
                <Card className="h-full transition-all hover:border-brand-400 hover:shadow-md">
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{g.name}</CardTitle>
                      {g.preModerate && <Badge tone="info">Moderated</Badge>}
                    </div>
                    <p className="mt-1.5 text-sm text-[var(--muted)]">{g.purpose}</p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </CardGrid>
        )}
      </Container>
    </Section>
  );
}
