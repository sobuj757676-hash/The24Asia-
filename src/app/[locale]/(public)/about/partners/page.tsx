import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { PageIntro, PublicSectionHeader } from "@/components/ui/page-intro";
import { ContactForm } from "@/components/public/contact-form";
import { Handshake, GraduationCap, Building2, HeartHandshake } from "lucide-react";
import { getPublicPartners } from "@/server/queries/public";

export const metadata = { title: "Partners" };

const WAYS = [
  {
    icon: <GraduationCap className="size-5" aria-hidden />,
    title: "Teach or train",
    body: "Send trainers, donate course licences, or run a workshop for our learners.",
  },
  {
    icon: <Building2 className="size-5" aria-hidden />,
    title: "Host us",
    body: "Offer a classroom, hall or sports facility at low or no cost on weekends.",
  },
  {
    icon: <HeartHandshake className="size-5" aria-hidden />,
    title: "Hire ethically",
    body: "Post roles with zero fees for workers — we verify every listing before publishing.",
  },
];

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const partners = await getPublicPartners();

  return (
    <Section>
      <Container size="wide">
        <PageIntro
          title="Our partners"
          description="We collaborate with institutions, employers and community organisations across Singapore. Nothing we do at scale happens alone."
        />

        {partners.length === 0 ? (
          <EmptyState
            icon={<Handshake className="size-5" aria-hidden />}
            title="Partners coming soon"
            description="We list partners here once an agreement is signed and they've agreed to be named publicly."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((p) => (
              <li
                key={p.id}
                className="flex min-h-24 items-center justify-center rounded-2xl border bg-[var(--card)] p-5 text-center text-sm font-semibold shadow-sm transition-shadow hover:shadow-md"
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14">
          <PublicSectionHeader
            title="Ways to partner"
            description="Three of the most useful things an organisation can offer us."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {WAYS.map((w) => (
              <div
                key={w.title}
                className="rounded-2xl border bg-[var(--card)] p-5 shadow-sm"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  {w.icon}
                </span>
                <h3 className="mt-3 font-semibold">{w.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{w.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 max-w-xl">
          <PublicSectionHeader
            title="Partner with us"
            description="Tell us how your organisation would like to collaborate and the partnerships team will reply."
          />
          <ContactForm type="partnership" />
        </div>
      </Container>
    </Section>
  );
}
