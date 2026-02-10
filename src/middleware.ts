import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain routing middleware.
 *
 * - `rvote.online` (no subdomain) → pass through to root app
 * - `myspace.rvote.online` → rewrite to /s/myspace/*
 * - Sets x-space-slug header for server components
 */

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "rvote.online";

function getSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(":")[0];

  // localhost development: use query param ?space=slug instead
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null; // Handled via search params in dev
  }

  // Check if hostname ends with root domain
  if (!hostname.endsWith(ROOT_DOMAIN)) {
    return null;
  }

  // Extract subdomain: "crypto.rvote.online" → "crypto"
  const subdomain = hostname.slice(0, -(ROOT_DOMAIN.length + 1)); // +1 for the dot

  if (!subdomain || subdomain === "www") {
    return null;
  }

  return subdomain;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;

  // Dev mode: support ?space=slug query param for local testing
  const devSpaceSlug = request.nextUrl.searchParams.get("space");
  const subdomain = getSubdomain(host) || devSpaceSlug;

  // No subdomain → root domain, pass through
  if (!subdomain) {
    return NextResponse.next();
  }

  // Don't rewrite paths that are already under /s/ (avoid double rewrite)
  if (pathname.startsWith("/s/")) {
    return NextResponse.next();
  }

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Rewrite to internal /s/[slug]/* route
  const url = request.nextUrl.clone();
  url.pathname = `/s/${subdomain}${pathname}`;

  const response = NextResponse.rewrite(url);
  response.headers.set("x-space-slug", subdomain);
  return response;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
