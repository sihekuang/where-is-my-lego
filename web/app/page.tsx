import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";

const CARDS = [
  { href: "/timeline", title: "Timeline", desc: "Chronological events, filterable by Confirmed / Allegation." },
  { href: "/parties", title: "Parties", desc: "Each party's public role in the dispute." },
  { href: "/lawsuit", title: "Lawsuit", desc: "Utah 4th District case, 13 causes of action." },
  { href: "/police", title: "Police", desc: "Arrests, search warrant, AFPD response." },
  { href: "/media", title: "Media", desc: "Cataloged news, videos, and statements." },
  { href: "/disclaimer", title: "Disclaimer", desc: "Scope, methodology, and limitations." },
];

export default function Home() {
  const md = getProse("home.md");
  return (
    <div>
      <div className="cards">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
      <Markdown>{md}</Markdown>
    </div>
  );
}
