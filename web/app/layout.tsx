import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, ROOT_TITLE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/structured-data";
import Link from "next/link";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { fontDisplay, fontSans } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: ROOT_TITLE, template: "%s · Where Is My Lego" },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
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

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/timeline", label: "Timeline" },
  { href: "/parties", label: "Parties" },
  { href: "/lawsuit", label: "Lawsuit" },
  { href: "/police", label: "Police" },
  { href: "/media", label: "Media" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontDisplay.variable, "font-sans")} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <JsonLd data={siteJsonLd()} />
          <header className="site-header">
            <div className="wrap header-inner">
              <Link href="/" className="brand">
                <svg
                  className="brand-logo"
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
                <span className="brand-text">
                  Where&nbsp;Is&nbsp;My&nbsp;Lego
                  <span className="brand-sub">BAM × Reckless Ben</span>
                </span>
              </Link>
              <nav className="nav">
                {NAV.map((n) => (
                  <Link key={n.href} href={n.href}>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <div className="notice wrap">
            Read-only archive · every claim is labeled <b>CONFIRMED</b> or{" "}
            <b>ALLEGATION</b> · no court has found any party liable. See the{" "}
            <Link href="/disclaimer">disclaimer</Link>.
          </div>

          <main className="wrap">{children}</main>

          <footer className="site-footer">
            <div className="wrap">
              <p>
                Content derived from the canonical Markdown in the{" "}
                <code>bam-scandal</code> repository. This site renders that record
                read-only; it does not modify the source.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
