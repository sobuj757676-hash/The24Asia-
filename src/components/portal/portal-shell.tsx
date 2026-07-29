import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/misc";
import { SignOutButton } from "./sign-out-button";

type NavItem = { href: string; label: string };

/**
 * Shared shell for authenticated portals (learner/volunteer) and admin.
 * Left rail on desktop, top bar on mobile (PRD 7.6).
 */
export async function PortalShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const tc = await getTranslations("common");
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <header className="border-b bg-[var(--card)]">
        <Container className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
            <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-white">
              24
            </span>
            <span>{title}</span>
          </Link>
          <SignOutButton label={tc("signOut")} />
        </Container>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav aria-label="Portal">
            <ul className="space-y-1">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main id="main" className="min-w-0 flex-1">
          {/* Mobile horizontal nav */}
          <nav
            aria-label="Portal"
            className="mb-4 flex gap-2 overflow-x-auto lg:hidden"
          >
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap rounded-full border px-3 py-1.5 text-sm"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
