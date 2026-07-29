import { setRequestLocale } from "next-intl/server";
import { Container, Section, EmptyState } from "@/components/ui/misc";
import { ContactForm } from "@/components/public/contact-form";
import { getPublicPartners } from "@/server/queries/public";

export const metadata = { title: "Partners" };

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
      <Container>
        <h1 className="text-3xl font-extrabold">Our partners</h1>
        <p className="mt-2 max-w-prose text-[var(--muted)]">
          We collaborate with institutions, employers and community
          organizations across Singapore.
        </p>

        {partners.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="Partners coming soon" />
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {partners.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-center rounded-xl border bg-[var(--card)] p-6 text-center font-medium"
              >
                {p.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 max-w-xl">
          <h2 className="text-xl font-bold">Partner with us</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Tell us how your organization would like to collaborate.
          </p>
          <div className="mt-4">
            <ContactForm type="partnership" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
