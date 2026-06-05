import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { getProse } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import { BrickCard, type BrickVariant } from "@/components/brick/BrickCard";

const CARDS: { href: string; key: string; descKey: string; variant: BrickVariant }[] = [
  { href: "/timeline", key: "nav.timeline", descKey: "home.card.timeline", variant: "confirmed" },
  { href: "/parties", key: "nav.parties", descKey: "home.card.parties", variant: "blue" },
  { href: "/lawsuit", key: "nav.lawsuit", descKey: "home.card.lawsuit", variant: "red" },
  { href: "/police", key: "nav.police", descKey: "home.card.police", variant: "allegation" },
  { href: "/media", key: "nav.media", descKey: "home.card.media", variant: "green" },
  { href: "/disclaimer", key: "nav.disclaimer", descKey: "home.card.disclaimer", variant: "orange" },
];

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale);
  const md = getProse("home.md", locale);
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Where Is My Lego</h1>
      <p className="mt-2 max-w-[60ch] text-muted-foreground">{t("home.tagline")}</p>
      <div className="my-6 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {CARDS.map((c) => (
          <Link key={c.href} href={`/${locale}${c.href}`} className="group no-underline">
            <BrickCard variant={c.variant} className="h-full p-4 transition-transform group-hover:-translate-y-0.5">
              <h3 className="font-display text-base font-bold text-card-foreground">{t(c.key)}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{t(c.descKey)}</p>
            </BrickCard>
          </Link>
        ))}
      </div>
      <Markdown>{md}</Markdown>
    </div>
  );
}
