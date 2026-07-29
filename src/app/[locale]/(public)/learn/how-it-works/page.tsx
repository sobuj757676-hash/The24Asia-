import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container, Section } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export const metadata = { title: "How free training works" };

const STEPS = [
  { n: 1, title: "Browse courses", body: "Explore our free courses and see what fits your goals." },
  { n: 2, title: "Apply to a batch", body: "Pick an upcoming batch and submit a short application — it only takes a minute." },
  { n: 3, title: "Get confirmed", body: "Our team reviews your application and confirms your place. You'll get a notification." },
  { n: 4, title: "Attend & learn", body: "Join the sessions in person or online. Materials are available in your account." },
  { n: 5, title: "Earn your certificate", body: "Complete the course and receive a verifiable 24Asia certificate you can share with employers." },
];

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-extrabold">How free training works</h1>
        <p className="mt-2 text-[var(--muted)]">
          All 24Asia training is 100% free for migrant workers. Here&apos;s the journey.
        </p>
        <ol className="mt-8 space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-2xl border bg-[var(--card)] p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">
                {s.n}
              </span>
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-[var(--muted)]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Button asChild size="lg"><Link href="/learn">Browse courses</Link></Button>
        </div>
      </Container>
    </Section>
  );
}
