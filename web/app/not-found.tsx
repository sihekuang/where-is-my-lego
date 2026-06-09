import Link from "next/link";
import type { Metadata } from "next";
import "./globals.css";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { DEFAULT_LOCALE } from "@/lib/locales.mjs";

// Global 404. Returns a real 404 status (good for crawlers — no soft-404) and offers a clear route
// back to the archive home page. This app has no root layout, so Next provides the <html>/<body>
// shell for the not-found boundary; we render only the content (the font vars go on the wrapper).
export const metadata: Metadata = {
  title: "Page not found · Where Is My Lego",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      className={`${fontSans.variable} ${fontDisplay.variable} font-sans flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 py-16 text-center text-foreground`}
    >
      <p className="font-display text-7xl font-extrabold tracking-tight text-muted-foreground">404</p>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">This page could not be found</h1>
      <p className="max-w-[40ch] text-muted-foreground">
        The page you’re looking for doesn’t exist or may have moved. Head back to the archive home
        page to find what you need.
      </p>
      <Link
        href={`/${DEFAULT_LOCALE}`}
        className="mt-1 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground no-underline transition-opacity hover:opacity-90"
      >
        Go to the homepage
      </Link>
    </main>
  );
}
