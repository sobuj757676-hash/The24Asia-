import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Card, CardBody, CardTitle } from "@/components/ui/card";

export const metadata = { title: "About" };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-extrabold">About 24Asia</h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          24Asia is a migrant-led volunteer group in Singapore. We believe
          migrant empowerment, community collaboration, career growth and mental
          wellbeing are the keys to creating a positive impact in our societies.
        </p>
        <p className="mt-4">
          We run free training, social counselling, entertainment, team
          building, blood donation drives and environmental activities — driven
          by hundreds of volunteers who give their time and skills.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { href: "/about/team", title: "Our team" },
            { href: "/about/partners", title: "Partners" },
            { href: "/about/contact", title: "Contact us" },
          ].map((l) => (
            <Link key={l.href} href={l.href}>
              <Card className="transition-colors hover:border-brand-400">
                <CardBody>
                  <CardTitle className="text-base">{l.title}</CardTitle>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
