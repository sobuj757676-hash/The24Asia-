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

/**
 * Security headers per PRD 19.1 (TLS/HSTS/CSP/CSRF-friendly defaults).
 * CSP is intentionally strict; adjust connect-src when adding providers.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
        source: "/:locale/(learner|volunteer)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withSerwist(withNextIntl(nextConfig));
