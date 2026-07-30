import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Never precache authenticated/admin/api routes (PRD 13.2 - no restricted data offline).
  disable: process.env.NODE_ENV === "development",
});

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy (PRD 19.1). This header was previously described in
 * a comment but never actually sent — the app shipped with no CSP at all.
 *
 * `script-src` allows 'unsafe-inline' because Next.js injects inline bootstrap
 * and flight-data scripts. Nonce plumbing is not used here: the nonce would
 * have to be threaded through the next-intl middleware response, and getting
 * that subtly wrong silently breaks every page. The remaining directives still
 * remove the highest-value attack primitives (base tag hijacking, plugin
 * execution, framing, cross-origin form posts), and the app renders no
 * user-supplied HTML — there is no `dangerouslySetInnerHTML` anywhere in the
 * codebase — so the inline-script allowance is a narrow residual risk.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Stripe Checkout is a redirect, but its JS is loaded for card fields.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://api.stripe.com${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self' https:",
  "upgrade-insecure-requests",
].join("; ");

/** Security headers per PRD 19.1 (TLS/HSTS/CSP/CSRF-friendly defaults). */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // PRD 21.1: optimize media aggressively for low-end Android / slow 4G.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Keep client JS small (PRD 21.1: initial JS <= 100KB target).
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Admin/portal/api must never be indexed (PRD 17).
      {
        source: "/:locale/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // These patterns must match the real route names — they previously
        // pointed at /learner and /volunteer, which do not exist, so the
        // signed-in panels were never actually marked noindex.
        source: "/:locale/(account|volunteer-portal|partner-portal|dashboard)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:locale/(account|volunteer-portal|partner-portal|dashboard)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:locale/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
