import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse, getRelationships } from "@/lib/content";
import { BrickCard, type BrickVariant } from "@/components/brick/BrickCard";
import HeroGraph from "@/components/HeroGraph";

const CARDS: { href: string; title: string; desc: string; variant: BrickVariant }[] = [
  { href: "/timeline", title: "Timeline", desc: "Chronological events, filterable by Confirmed / Allegation.", variant: "confirmed" },
  { href: "/parties", title: "Parties", desc: "Each party's public role in the dispute.", variant: "blue" },
  { href: "/lawsuit", title: "Lawsuit", desc: "Utah 4th District case, 13 causes of action.", variant: "red" },
  { href: "/police", title: "Police", desc: "Arrests, search warrant, AFPD response.", variant: "allegation" },
  { href: "/media", title: "Media", desc: "Cataloged news, videos, and statements.", variant: "green" },
  { href: "/disclaimer", title: "Disclaimer", desc: "Scope, methodology, and limitations.", variant: "orange" },
];

export default function Home() {
  const md = getProse("home.md");
  const graph = getRelationships();
  return (
    <div>
      <h1 className="sr-only">Where Is My Lego</h1>
      <HeroGraph data={graph} />
      <p className="mt-6 max-w-[60ch] text-muted-foreground">
        A man and his elderly father (reported ~83) spent 25 years building a LEGO Star Wars collection — then say a shop never gave it back. An archival record of the Bricks &amp; Minifigs &ldquo;Reckless Ben&rdquo; dispute that followed, every claim labeled Confirmed or Allegation.
      </p>
      <div className="my-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="group no-underline">
            <BrickCard variant={c.variant} className="h-full p-4 transition-transform group-hover:-translate-y-0.5">
              <h3 className="font-display text-base font-bold text-card-foreground">{c.title}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{c.desc}</p>
            </BrickCard>
          </Link>
        ))}
      </div>
      <Markdown>{md}</Markdown>
    </div>
  );
}
