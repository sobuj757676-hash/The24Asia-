import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { PageIntro, PublicSectionHeader } from "@/components/ui/page-intro";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import {
  GraduationCap,
  HandHeart,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getContentItem } from "@/server/queries/public";

export const metadata = { title: "Our team" };

/**
 * How the organisation is actually structured. The teams below are the real
 * volunteer functions the platform models (they map to the role names in
 * `lib/auth/permissions`), so this page says something true and useful even
 * before the CMS page body is written — rather than the "profiles will appear
 * here" placeholder it used to show.
 */
const TEAMS = [
  {
    icon: <GraduationCap className="size-5" aria-hidden />,
    name: "Training & trainers",
    body: "Volunteer trainers and course coordinators who plan each batch, teach the sessions and mark attendance.",
  },
  {
    icon: <HandHeart className="size-5" aria-hidden />,
    name: "Volunteer coordination",
    body: "Reviews applications, runs onboarding, assigns shifts and approves logged hours and expenses.",
  },
  {
    icon: <LifeBuoy className="size-5" aria-hidden />,
    name: "Wellbeing & support",
    body: "Trained listeners who handle confidential support requests and referrals to partner services.",
  },
  {
    icon: <ShieldCheck className="size-5" aria-hidden />,
    name: "Safeguarding",
    body: "A named safeguarding lead oversees risk, incidents and anything involving vulnerable members.",
  },
  {
    icon: <Megaphone className="size-5" aria-hidden />,
    name: "Communications & events",
    body: "Runs the live shows, community events, newsletter and our public channels.",
  },
  {
    icon: <Users className="size-5" aria-hidden />,
    name: "Community moderation",
    body: "Volunteer moderators who read every group and act on reports privately.",
  },
];

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  // An editor can publish a CMS page at slug "team" to add names, photos or a
  // letter from the founders; it renders above the structural summary.
  const page = await getContentItem("page", "team");

  return (
    <Section>
      <Container className="max-w-3xl">
        <PageIntro
          eyebrow={<Badge tone="brand">Volunteer-run</Badge>}
          title={page?.tr.title ?? "Our team"}
          description={
            page?.tr.summary ??
            "24Asia is powered by hundreds of migrant volunteers, trainers, mentors and community leaders — most of whom arrived in Singapore as migrant workers themselves."
          }
        />

        {page?.tr.body && (
          <div className="whitespace-pre-wrap leading-relaxed">{page.tr.body}</div>
        )}

        <div className="mt-12">
          <PublicSectionHeader
            title="How we're organised"
            description="Every function below is led by volunteers, with a named person accountable for it."
          />
          <ul className="grid gap-4 sm:grid-cols-2">
            {TEAMS.map((team) => (
              <li
                key={team.name}
                className="rounded-2xl border bg-[var(--card)] p-5 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {team.icon}
                </span>
                <h3 className="mt-3 font-semibold">{team.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{team.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border bg-ink-50/60 p-5 dark:bg-ink-800/40">
          <p className="text-sm">
            <span className="font-semibold">On naming people. </span>
            We publish an individual volunteer&apos;s name or photo only with their
            explicit, revocable consent — many of our volunteers and members have
            good reasons for privacy. That is why this page describes teams rather
            than listing everyone.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/volunteer">Join the team</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/about/contact">Contact us</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
