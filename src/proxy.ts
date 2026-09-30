import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Optimistic redirect only -- checks that a session cookie exists, not that
 * it's still valid. This is intentionally cheap (no DB call, no shared
 * Prisma client) since proxy can run outside the main app process. It only
 * improves UX (skip the flash of a protected page before bouncing back);
 * the actual authorization check happens in each protected layout via
 * requireUser(), and independently inside every Server Action/Route Handler.
 */
export function proxy(request: NextRequest) {
  const hasSession = getSessionCookie(request);
  if (!hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/experiences/:path*",
    "/challenges/:path*",
    "/link-cards/:path*",
    "/experiments/:path*",
    "/prompt/:path*",
    "/settings/:path*",
  ],
};
