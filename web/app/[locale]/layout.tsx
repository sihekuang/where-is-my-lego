import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, ROOT_TITLE, localizedPath, languageAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/structured-data";
import Link from "next/link";
import "../globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { fontDisplay, fontSans, fontCJK } from "@/lib/fonts";
import { ModeToggle } from "@/components/ModeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LOCALES, isLocale, getLocale } from "@/lib/locales.mjs";
import { getDict } from "@/lib/i18n";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = getLocale(locale)!; // getLocale always falls back to the default locale
  const url = localizedPath(locale, "/");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: ROOT_TITLE, template: "%s · Where Is My Lego" },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    alternates: { canonical: url, languages: languageAlternates("/") },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: loc.ogLocale,
      url,
      title: ROOT_TITLE,
      description: DEFAULT_DESCRIPTION,
    },
    twitter: { card: "summary_large_image", title: ROOT_TITLE, description: DEFAULT_DESCRIPTION },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: l.code }));
}

const NAV = [
  { href: "", key: "nav.overview" },
  { href: "/timeline", key: "nav.timeline" },
  { href: "/parties", key: "nav.parties" },
  { href: "/lawsuit", key: "nav.lawsuit" },
  { href: "/police", key: "nav.police" },
  { href: "/media", key: "nav.media" },
  { href: "/media/community-sources", key: "nav.sources" },
  { href: "/disclaimer", key: "nav.disclaimer" },
];

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const cjk = getLocale(locale)?.isCJK ?? false;
  const base = `/${locale}`;
  return (
    <html lang={locale} className={cn(fontSans.variable, fontDisplay.variable, cjk && fontCJK.variable, "font-sans")} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <JsonLd data={siteJsonLd(locale)} />
          <header className="sticky top-0 z-10 border-b-2 border-border bg-card/95 backdrop-blur">
            <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-between gap-4 px-5 py-3">
              <Link href={base} className="flex items-center gap-2.5 font-display font-extrabold leading-none text-foreground no-underline">
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 64 64"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <g transform="translate(-2.5,-3.5)">
                    <polygon points="48,28 57,17 57,43 48,54" fill="#b06a18" stroke="#8a5212" strokeWidth="0.5" />
                    <polygon points="12,28 48,28 57,17 21,17" fill="#f0a24a" stroke="#8a5212" strokeWidth="0.5" />
                    <polygon points="12,28 48,28 48,54 12,54" fill="#d8862a" stroke="#8a5212" strokeWidth="0.5" />
                    <ellipse cx="28.6" cy="22.1" rx="4.6" ry="2.4" fill="#c2761f" />
                    <ellipse cx="28.6" cy="20.1" rx="4.6" ry="2.4" fill="#f4b266" />
                    <ellipse cx="44.4" cy="22.1" rx="4.6" ry="2.4" fill="#c2761f" />
                    <ellipse cx="44.4" cy="20.1" rx="4.6" ry="2.4" fill="#f4b266" />
                    <ellipse cx="25.0" cy="26.5" rx="4.6" ry="2.4" fill="#c2761f" />
                    <ellipse cx="25.0" cy="24.5" rx="4.6" ry="2.4" fill="#f4b266" />
                    <ellipse cx="40.8" cy="26.5" rx="4.6" ry="2.4" fill="#c2761f" />
                    <ellipse cx="40.8" cy="24.5" rx="4.6" ry="2.4" fill="#f4b266" />
                    <text
                      x="30"
                      y="48"
                      fontFamily="Arial Black, Arial, Helvetica, sans-serif"
                      fontSize="23"
                      fontWeight="900"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      ?
                    </text>
                  </g>
                </svg>
                <span className="flex flex-col">
                  Where&nbsp;Is&nbsp;My&nbsp;Lego
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">BAM × Reckless Ben</span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <nav className="flex flex-wrap gap-3.5 text-sm text-muted-foreground">
                  {NAV.map((n) => (
                    <Link key={n.key} href={`${base}${n.href}`} className="hover:text-foreground">{t(n.key)}</Link>
                  ))}
                </nav>
                <LanguageSwitcher current={locale} />
                <ModeToggle />
              </div>
            </div>
          </header>

          <div className="mx-auto mt-3.5 max-w-[980px] rounded-md border border-border bg-muted px-3.5 py-2.5 text-[13px] text-muted-foreground">
            {t("banner.readonly")}{" "}
            <Link href={`${base}/disclaimer`} className="text-primary hover:underline">{t("banner.seeDisclaimer")}</Link>
          </div>

          <main className="mx-auto max-w-[980px] px-5 pb-12 pt-6">{children}</main>

          <footer className="baseplate mt-8 border-t-2 border-border py-5 text-[13px] text-muted-foreground">
            <div className="mx-auto max-w-[980px] px-5">
              <p>{t("footer.derived")}{" "}
                <a
                  href="https://github.com/sihekuang/where-is-my-lego"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  <code className="rounded bg-muted px-1.5 py-0.5">where-is-my-lego</code>
                </a></p>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
