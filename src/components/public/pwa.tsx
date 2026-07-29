"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Registers the Serwist service worker after load (PRD 13.1). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline features are progressive; ignore failures */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}

type BIPEvent = Event & { prompt: () => Promise<void> };

/**
 * Install education shown only after engagement, never as an immediate
 * blocking prompt (PRD 13.1). Dismissible.
 */
export function InstallPrompt() {
  const tc = useTranslations("common");
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      // Delay showing until the user has engaged a little.
      const dismissed = localStorage.getItem("24a-install-dismissed");
      if (!dismissed) setTimeout(() => setHidden(false), 8000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (hidden || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-sm rounded-2xl border bg-[var(--card)] p-4 shadow-lg lg:bottom-4">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Download className="size-5" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{tc("installApp")}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            24Asia · works offline · saves data
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={async () => {
                await deferred.prompt();
                setHidden(true);
              }}
            >
              {tc("installApp")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                localStorage.setItem("24a-install-dismissed", "1");
                setHidden(true);
              }}
            >
              {tc("close")}
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label={tc("close")}
          onClick={() => setHidden(true)}
          className="grid size-8 place-items-center rounded-lg hover:bg-ink-100"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
