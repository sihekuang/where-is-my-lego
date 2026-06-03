import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BAM × Reckless Ben — Archive",
  description:
    "A sourced, read-only research archive of the Bricks & Minifigs (BAM) – Reckless Ben controversy. Content is derived from canonical Markdown.",
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
