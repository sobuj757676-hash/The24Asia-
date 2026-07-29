import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Route groups that require an authenticated session. Fine-grained permission
 * checks happen server-side in each segment (PRD 10.8); this is only a coarse
 * gate + redirect so unauthenticated users never see portal shells.
 */
const PROTECTED = /^\/(en|bn|ta)?\/?(admin|account|volunteer-portal|partner-portal)(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED.test(pathname)) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except api, static assets, and the service worker.
  matcher: [
    "/((?!api|_next|_vercel|sw.js|manifest.webmanifest|icons|.*\\..*).*)",
  ],
};
