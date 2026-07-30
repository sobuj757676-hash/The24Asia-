import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { PageIntro, PublicSectionHeader } from "@/components/ui/page-intro";
import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/status-badge";
import {
  ArrowRight,
  Users,
  Handshake,
  Mail,
  ScrollText,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Leaf,
} from "lucide-react";

export const metadata = { title: "About" };

const PILLARS = [
  {
    icon: <GraduationCap className="size-5" aria-hidden />,
    title: "Skills & employability",
    body: "Free courses in digital skills, workplace safety, communication and literacy — taught by volunteers, open to every migrant worker.",
  },
  {
    icon: <HeartPulse className="size-5" aria-hidden />,
    title: "Wellbeing & support",
    body: "Confidential listening, a directory of trusted services, and urgent-help routes when something goes badly wrong.",
  },
  {
    icon: <Sparkles className="size-5" aria-hidden />,
    title: "Community & culture",
    body: "Live shows, sports, festivals and talent nights that celebrate the people who build this city.",
  },
  {
    icon: <Leaf className="size-5" aria-hidden />,
    title: "Giving back together",
    body: "Blood donation drives, clean-ups and environmental activities led by migrant volunteers.",
  },
];

const LINKS = [
  {
    href: "/about/team",
    title: "Our team",
    body: "The volunteers and coordinators behind 24Asia.",
    icon: <Users className="size-5" aria-hidden />,
  },
  {
    href: "/about/partners",
    title: "Partners",
    body: "Organisations that host, fund and teach alongside us.",
    icon: <Handshake className="size-5" aria-hidden />,
  },
  {
    href: "/about/contact",
    title: "Contact us",
    body: "Questions, offers of help, or media enquiries.",
    icon: <Mail className="size-5" aria-hidden />,
  },
  {
    href: "/policies",
    title: "Policies",
    body: "Safeguarding, privacy and complaints, published in full.",
    icon: <ScrollText className="size-5" aria-hidden />,
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container className="max-w-4xl">
        <PageIntro
          eyebrow={<Badge tone="brand">Migrant-led · Singapore</Badge>}
          title="About 24Asia"
          description="24Asia is a migrant-led volunteer group in Singapore. We believe migrant empowerment, community collaboration, career growth and mental wellbeing are the keys to creating a positive impact in our societies."
        />

        <p className="max-w-prose text-base leading-relaxed">
          Everything we do is free for the people we serve, and most of it is run by
          people who arrived in Singapore as migrant workers themselves. Hundreds of
          volunteers give their time, skills and weekends to make it happen.
        </p>

        <div className="mt-12">
          <PublicSectionHeader
            title="What we do"
            description="Four areas of work, one goal: a community where migrant workers can learn, be well and belong."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border bg-[var(--card)] p-5 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {p.icon}
                </span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <PublicSectionHeader title="Find out more" />
          <div className="grid gap-4 sm:grid-cols-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="group block h-full">
                <Card className="h-full transition-all hover:border-brand-400 hover:shadow-md">
                  <CardBody className="flex h-full flex-col">
                    <span className="text-brand-600 dark:text-brand-300">{l.icon}</span>
                    <CardTitle className="mt-2.5 text-base">{l.title}</CardTitle>
                    <p className="mt-1 flex-1 text-sm text-[var(--muted)]">{l.body}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                      Open
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
