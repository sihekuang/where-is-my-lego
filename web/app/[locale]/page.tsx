import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { BrickCard, type BrickVariant } from "@/components/brick/BrickCard";

const CARDS: { href: string; key: string; desc: string; variant: BrickVariant }[] = [
  { href: "/timeline", key: "nav.timeline", desc: "Chronological events, filterable by Confirmed / Allegation.", variant: "confirmed" },
  { href: "/parties", key: "nav.parties", desc: "Each party's public role in the dispute.", variant: "blue" },
  { href: "/lawsuit", key: "nav.lawsuit", desc: "Utah 4th District case, 13 causes of action.", variant: "red" },
  { href: "/police", key: "nav.police", desc: "Arrests, search warrant, AFPD response.", variant: "allegation" },
  { href: "/media", key: "nav.media", desc: "Cataloged news, videos, and statements.", variant: "green" },
  { href: "/disclaimer", key: "nav.disclaimer", desc: "Scope, methodology, and limitations.", variant: "orange" },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const md = getProse("home.md", locale);
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Where Is My Lego</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">
        An archival record of the Bricks &amp; Minifigs &ldquo;Reckless Ben&rdquo; dispute — every claim labeled Confirmed or Allegation.
      </p>
      <div className="my-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {CARDS.map((c) => (
          <Link key={c.href} href={`/${locale}${c.href}`} className="group no-underline">
            <BrickCard variant={c.variant} className="h-full p-4 transition-transform group-hover:-translate-y-0.5">
              <h3 className="font-display text-base font-bold text-card-foreground">{t(c.key)}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{c.desc}</p>
            </BrickCard>
          </Link>
        ))}
      </div>
      <Markdown>{md}</Markdown>
    </div>
  );
}
