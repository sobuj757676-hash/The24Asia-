import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/misc";

export const metadata = { title: "Our team" };

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container className="max-w-3xl">
        <h1 className="text-3xl font-extrabold">Our team</h1>
        <p className="mt-4 text-[var(--muted)]">
          24Asia is powered by hundreds of migrant volunteers, trainers, mentors
          and community leaders. Volunteer profiles are managed in the platform
          and published here with each person&apos;s consent.
        </p>
        <p className="mt-4 text-sm text-[var(--muted)]">
          Team directory content is managed through the admin CMS. Approved,
          consented public profiles will appear here.
        </p>
      </Container>
    </Section>
  );
}
