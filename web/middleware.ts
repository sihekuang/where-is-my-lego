import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locales.mjs";
import { ROUTE_PATHS } from "@/lib/routes.mjs";

const KNOWN = new Set(ROUTE_PATHS);

/** 308-redirect to the default-locale version of a locale-less path ("" → "/en", "/timeline" → "/en/timeline"). */
function toDefaultLocale(path: string, req: NextRequest) {
  return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${path}`, req.url));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // "/" → default-locale home.
  if (pathname === "/") return toDefaultLocale("", req);

  const segments = pathname.split("/").filter(Boolean);

  // Already locale-prefixed: let Next render it. Unknown sub-paths under a real locale
  // (e.g. /en/nope) fall through to the 404 page — they are NOT redirected.
  if (isLocale(segments[0])) return NextResponse.next();

  // A locale-LESS known route, e.g. /timeline → /en/timeline (also /lawsuit/documents).
  if (KNOWN.has(pathname)) return toDefaultLocale(pathname, req);

  // A wrong/unknown locale in front of a known route, e.g. /fr/timeline → /en/timeline.
  if (segments.length >= 2) {
    const rest = `/${segments.slice(1).join("/")}`;
    if (KNOWN.has(rest)) return toDefaultLocale(rest, req);
  }

  // Genuinely unknown URL (e.g. /totally-made-up, /fr) → fall through to the real 404 page.
  return NextResponse.next();
}

export const config = {
  // Run on every request except Next internals (_next/…) and files with an extension
  // (sitemap.xml, robots.txt, *.svg/*.png, manifest.webmanifest, favicon.ico, …).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
