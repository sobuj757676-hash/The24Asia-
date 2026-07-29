"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, LOCALE_LABELS } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useTransition } from "react";

/**
 * Language chooser. The user picks the language explicitly; it is never
 * inferred from IP/nationality/SIM (PRD 16.1).
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <Globe className="size-4" aria-hidden />
      <span className="sr-only">Language</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className="rounded-lg border border-ink-300 bg-transparent px-2 py-1"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l] ?? l}
          </option>
        ))}
      </select>
    </label>
  );
}
