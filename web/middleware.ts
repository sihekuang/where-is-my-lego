import { NextResponse, type NextRequest } from "next/server";
import { isLocale, negotiateLocale } from "@/lib/locales.mjs";

// Cookie written by the language switcher to remember an explicit choice. An
// explicit pick beats the browser's Accept-Language guess on the next "/" visit.
const LOCALE_COOKIE = "locale";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/") return NextResponse.next();

  const saved = req.cookies.get(LOCALE_COOKIE)?.value;
  const target = saved && isLocale(saved)
    ? saved
    : negotiateLocale(req.headers.get("accept-language"));

  const res = NextResponse.redirect(new URL(`/${target}`, req.url));
  // The "/" -> "/<locale>" target depends on the request's cookie + language
  // header, so caches/CDNs must key on both rather than serving one redirect to
  // everyone.
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = { matcher: ["/"] };
