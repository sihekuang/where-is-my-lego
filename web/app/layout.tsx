import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, ROOT_TITLE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/structured-data";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en">
      <body>
        <JsonLd data={siteJsonLd()} />
        <header className="site-header">
          <div className="wrap header-inner">
            <Link href="/" className="brand">
              BAM&nbsp;×&nbsp;Reckless&nbsp;Ben
              <span className="brand-sub">research archive</span>
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
      </body>
    </html>
  );
}
