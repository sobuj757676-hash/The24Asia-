import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { PageIntro } from "@/components/ui/page-intro";
import { ContactForm } from "@/components/public/contact-form";
import { AlertTriangle, Clock, Handshake, LifeBuoy } from "lucide-react";

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
        <PageIntro
          title="Contact us"
          description="Have a question, an offer of help, or a media enquiry? Send a message and the right team will follow up."
          className="mb-6"
        />

        {/* Route people who need help NOW away from a general contact form. */}
        <div className="flex items-start gap-3 rounded-2xl border-2 border-accent-500 bg-accent-500/5 p-4">
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-accent-600"
            aria-hidden
          />
          <p className="text-sm">
            <span className="font-semibold">Need help urgently? </span>
            This form is not monitored around the clock. For anything urgent use{" "}
            <Link href="/support/urgent-help" className="font-medium underline">
              urgent help
            </Link>
            , or call 999 (police) or 995 (ambulance).
          </p>
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="flex items-start gap-2.5 rounded-2xl border bg-[var(--card)] p-4 text-sm">
            <LifeBuoy className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <span>
              <span className="block font-medium">Need support?</span>
              <Link href="/support" className="text-[var(--muted)] underline">
                Get support
              </Link>
            </span>
          </li>
          <li className="flex items-start gap-2.5 rounded-2xl border bg-[var(--card)] p-4 text-sm">
            <Handshake className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
            <span>
              <span className="block font-medium">Organisation?</span>
              <Link href="/about/partners" className="text-[var(--muted)] underline">
                Partner with us
              </Link>
            </span>
          </li>
        </ul>

        <div className="mt-6">
          <ContactForm type="contact" />
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-[var(--muted)]">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          We&apos;re a volunteer team, so replies usually take a few working days. Every
          message is logged and assigned to someone — nothing lands in an unowned
          inbox.
        </p>
      </Container>
    </Section>
  );
}
