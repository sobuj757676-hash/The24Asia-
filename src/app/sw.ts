/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * Serwist service worker (PRD 13). Caches the app shell + previously visited
 * public pages. It MUST NOT cache authenticated/admin/api responses or any
 * restricted data (PRD 13.2). navigateFallback serves an offline page.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// Never cache auth/admin/portal/api routes - keep restricted data off-device.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const noCache =
    url.pathname.startsWith("/api") ||
    url.pathname.includes("/admin") ||
    url.pathname.includes("/account") ||
    url.pathname.includes("/volunteer-portal") ||
    url.pathname.includes("/sign-in");
  if (noCache) {
    // Let the network handle it; do not intercept for caching.
    return;
  }
});

serwist.addEventListeners();
