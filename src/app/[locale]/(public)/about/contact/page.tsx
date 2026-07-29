import { setRequestLocale } from "next-intl/server";
import { Container, Section } from "@/components/ui/misc";
import { ContactForm } from "@/components/public/contact-form";

export const metadata = { title: "Contact us" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container className="max-w-xl">
        <h1 className="text-3xl font-extrabold">Contact us</h1>
        <p className="mt-2 text-[var(--muted)]">
          Have a question or want to work with us? Send a message and the right
          team will follow up.
        </p>
        <div className="mt-6">
          <ContactForm type="contact" />
        </div>
      </Container>
    </Section>
  );
}
